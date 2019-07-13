const {db, firebase}= require('../config/db.js');

getTopVideos = async()=>{
    var topVideos=[];
    ref = db.ref("videos").orderByChild("topVideo").equalTo(1).limitToLast(12);
    await ref.once("value", async function(snapshot) {
        snapshot.forEach((snap)=>{
            topVideos.push(snap.val());
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
        const limit =parseInt(offset)+nbQueries;
    
        if(maestro==null){
            if(type=="all"){
                var fb=db.ref(`/videos`).orderByChild("datePublication").limitToLast(limit);
            }else{
                var fb=db.ref(`/videos`).orderByChild("type").equalTo(type).limitToLast(limit);
            }
        }else{
            if(type=="all"){
                var fb=db.ref("maestros/"+maestro.key +"/videos").orderByChild("datePublication").limitToLast(limit);
            }else{
                var fb=db.ref("maestros/"+maestro.key +"/videos").orderByChild("type").equalTo(type).limitToLast(limit);
            }
        }
    
        await fb.once("value",(snapshot) =>{
            snapshot.forEach((snap)=>{
                videos.push(snap.val());
            });
            videos.reverse();
            videos.splice(0, offset);
        }); 
    
        resolve(videos);
    });  
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

exports.getTopVideos=getTopVideos;
exports.getAllTopVideos=getAllTopVideos;
exports.getVideos=getVideos;
exports.getDeletedVideos=getDeletedVideos;
