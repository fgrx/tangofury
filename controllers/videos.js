const {db, firebase}= require('../config/db.js');
const Maestros=require("./maestros");

getTopVideos = async()=>{
    var topVideos=[];
    ref = db.ref("videos").orderByChild("topVideo").equalTo(1).limitToLast(12);
    await ref.once("value", async function(snapshot) {
        snapshot.forEach((snap)=>{
            let videoArray=snap.val();
            videoArray.key=snap.key;
            topVideos.push(videoArray);
        });
    }); 
    
    return topVideos.reverse();
}

getAllTopVideos = async(offset)=>{
    let topVideos=[];
    let nbQueries=24;
    const limit =parseInt(offset)+nbQueries;

    ref = db.ref("videos").orderByChild("topVideo").equalTo(1).limitToLast(limit);
    await ref.once("value", async function(snapshot) {
        snapshot.forEach((snap)=>{
            topVideos.push(snap.val());
        });
    }); 

    return topVideos.reverse().splice(0, offset);
}

getVideos= (maestro)=>(type)=>(offset)=>(nbQueries)=>{
    return new Promise(async(resolve)=>{
        let videos=[];
        var testOffset=parseInt(offset);
        if(isNaN(testOffset))testOffset=0;

        const limit =testOffset+nbQueries;
        if(maestro==null){
            if(type=="all"){
                //var fb=db.ref(`/videos`).orderByChild("datePublication").limitToLast(limit);
                var fb=db.ref(`/videos`).orderByChild("dateAdd").limitToLast(limit);
            }else{
                var fb=db.ref(`/videos`).orderByChild("type").equalTo(type).limitToLast(limit);
            }
        }else{
            if(type=="all"){
                //var fb=db.ref("maestros/"+maestro.key +"/videos").orderByChild("datePublication").limitToLast(limit);
                var fb=db.ref("maestros/"+maestro.key +"/videos").orderByChild("dateAdd").limitToLast(limit);
            }else{
                var fb=db.ref("maestros/"+maestro.key +"/videos").orderByChild("type").equalTo(type).limitToLast(limit);
            }
        }
    
        await fb.once("value",(snapshot) =>{
            snapshot.forEach((snap)=>{
                let videoArray=snap.val();
                videoArray.key=snap.key;
                videos.push(videoArray);
            });
            videos.reverse();
            videos.splice(0, offset);
        }); 
        resolve(videos);
    });  
}

deleteVideo=async(videoKey)=>{
    //delete video from maestros
    const maestroList=await Maestros.getMaestros("");
    maestroList.forEach(maestro => {
        db
        .ref("maestros/"+maestro.key+"/videos")
        .orderByChild("youtubeId")
        .equalTo(videoKey)
        .once("value")
        .then((querySnapshot) => {
            querySnapshot.forEach(function (doc) {
                db.ref("maestros/"+maestro.key+"/videos/"+doc.key).set(null);
            });
        });
    });

    //delete from general
    db.ref("videos/"+videoKey).set(null);
    db.ref(`/videos-deleted/`).push(videoKey);
}

getDeletedVideos=async()=>{
    let deletedVideos=Array();

    const fnRef=db.ref("videos-deleted");
    const querySnapshot= await fnRef.once("value");

    querySnapshot.forEach(function (doc) {
        deletedVideos.push(doc.val());
    });

    return deletedVideos;
}

setTopVideos=(videoKey)=>(mode)=>{
    db.ref(`/videos/${videoKey}`).once("value")
    .then((doc) => {
            let video=doc.val();
            video.topVideo=parseInt(mode);
            return db.ref(`/videos/${videoKey}`).set(video);
    });
}

changeVideoType=(videoKey)=>(typeVideo)=>{
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

exports.getTopVideos=getTopVideos;
exports.getAllTopVideos=getAllTopVideos;
exports.getVideos=getVideos;
exports.deleteVideo=deleteVideo;
exports.getDeletedVideos=getDeletedVideos;
exports.setTopVideos=setTopVideos;
exports.changeVideoType=changeVideoType;