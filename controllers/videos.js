const {db, firebase}= require('../config/db.js');
const Maestros=require("./maestros");

const getTopVideos = async()=>{
    let topVideos=[];
    const ref = db.ref("videos").orderByChild("topVideo").equalTo(1).limitToLast(12);
    await ref.once("value", async function(snapshot) {
        snapshot.forEach((snap)=>{
            let videoArray=snap.val();
            videoArray.key=snap.key;
            videoArray.title=purifyText(videoArray.title);
            topVideos.push(videoArray);
        });
    }); 
    
    return topVideos.reverse();
}

const getAllTopVideos = async(offset)=>{
    let topVideos=[];
    let nbQueries=24;
    const limit =parseInt(offset)+nbQueries;

    const ref = db.ref("videos").orderByChild("topVideo").equalTo(1).limitToLast(limit);
    await ref.once("value", async function(snapshot) {
        snapshot.forEach((snap)=>{
            snap.val().title=purifyText(snap.val().title);
            topVideos.push(snap.val());
        });
    }); 

    return topVideos.reverse().splice(offset, offset+24);
}

const getVideos= (maestro)=>(type)=>(offset)=>async(nbQueries)=>{
    let videos=[];
    let testOffset=parseInt(offset);
    if(isNaN(testOffset))testOffset=0;

    const limit =testOffset+nbQueries;
    let fb;

    if(maestro==null){
        if(type=="all"){
            //var fb=db.ref(`/videos`).orderByChild("datePublication").limitToLast(limit);
            fb=db.ref(`/videos`).orderByChild("dateAdd").limitToLast(limit);
        }else{
            fb=db.ref(`/videos`).orderByChild("type").equalTo(type).limitToLast(limit);
        }
    }else{
        if(type=="all"){
            //var fb=db.ref("maestros/"+maestro.key +"/videos").orderByChild("datePublication").limitToLast(limit);
            fb=db.ref("maestros/"+maestro.key +"/videos").orderByChild("dateAdd").limitToLast(limit);
        }else{
            fb=db.ref("maestros/"+maestro.key +"/videos").orderByChild("type").equalTo(type).limitToLast(limit);
        }
    }

    await fb.once("value",(snapshot) =>{
        snapshot.forEach((snap)=>{
            let videoArray=snap.val();
            videoArray.title=purifyText(videoArray.title);
            videoArray.key=snap.key;
            videos.push(videoArray);
        });
        videos.reverse();
        videos.splice(0, offset);
    }); 
    return(videos); 
}

const deleteVideo=(videoKey)=>async(youtubeId)=>{
    //delete video from maestros

    const maestroList=await Maestros.getMaestros();
    maestroList.forEach(maestro => {   
        console.log("maestros/"+maestro.key+"/videos");
        db
        .ref("maestros/"+maestro.key+"/videos")
        .orderByChild("youtubeId")
        .equalTo(youtubeId)
        .once("value")
        .then((querySnapshot) => {
            //console.log(querySnapshot)
            querySnapshot.forEach(function (doc) {
                //console.log(doc)
                //console.log("delete",doc)
                db.ref("maestros/"+maestro.key+"/videos/"+doc.key).set(null);
            });
        });
    });

    //delete from general
    db.ref("videos/"+videoKey).set(null);
    db.ref(`/videos-deleted/`).push(youtubeId);
}

const getDeletedVideos=async()=>{
    let deletedVideos=Array();

    const fnRef=db.ref("videos-deleted");
    const querySnapshot= await fnRef.once("value");

    querySnapshot.forEach(function (doc) {
        deletedVideos.push(doc.val());
    });

    return deletedVideos;
}

const setTopVideos=(videoKey)=>(mode)=>{
    db.ref(`/videos/${videoKey}`).once("value")
    .then((doc) => {
            let video=doc.val();
            video.topVideo=parseInt(mode);
            return db.ref(`/videos/${videoKey}`).set(video);
    });
}

const changeVideoType=(videoKey)=>(typeVideo)=>{
    //Dans le général
    db.ref(`/videos/${videoKey}`).once("value")
    .then(async(doc) => {
        let video=doc.val();
        video.type=typeVideo;

        const maestroList=await Maestros.getMaestros("");
        maestroList.forEach(maestro => {
            db
                .ref("maestros/"+maestro.key+"/videos")
                .orderByChild("youtubeId")
                .equalTo(video.youtubeId)
                .once("value")
                .then((querySnapshot) => {
                    querySnapshot.forEach(function (doc) {
                        firebase.database().ref("maestros/"+maestro.key+"/videos"+"/"+doc.key).set(video);
                    });
                });
        });

        return db.ref(`/videos/${videoKey}`).set(video);
    });
}

const purifyText = (stringToPurify)=>{
    return stringToPurify.replace(/&amp;/g,"")
                        .replace(/&quot;/g,'"')
                        .replace(/&#39;/g,"'")
}

exports.getTopVideos=getTopVideos;
exports.getAllTopVideos=getAllTopVideos;
exports.getVideos=getVideos;
exports.deleteVideo=deleteVideo;
exports.getDeletedVideos=getDeletedVideos;
exports.setTopVideos=setTopVideos;
exports.changeVideoType=changeVideoType;