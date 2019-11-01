const {db}= require('../config/db.js');
const Maestros=require("./maestros");
const Videos=require('./videos');
const axios = require("axios");


const importVideos=async()=>{
    //Récupère la liste des maestros
    const maestros= await Maestros.getMaestros();

    const deletedVideos=await Videos.getDeletedVideos();

    maestros.forEach(async(maestro)=>{
        //if(maestro.key=="PO25e78zbd"){
            await setNbNewVideosMaestro(maestro.key)(0);
            const videos = await findVideos(maestro)(deletedVideos);
            await addVideos(maestro.key)(videos);
        //}
    });
    
    return "done!";
}

const addVideos=(maestroId)=>async(videos)=>videos.map(video=>addVideo(video)(maestroId));

const addVideo=(video)=>async(maestroID)=>{
    //construction of the video
    if(video.youtubeId){
        // Adding video to the general node
        //console.log("ingestion de la video ?"+ video.title +" "+video.youtubeId);
        if(isVideoPresentInGeneralNode(video)===false){
            const fnAddGeneral = db.ref(`videos/`)
            await fnAddGeneral.push(video)
            //console.log("video ajoutée dans le général "+video.youtubeId);
        }else{
            //console.log("vidéo déja présente dans le général");
        }

        //Adding the video to the maestro node
        if(isVideoPresentInMaestroNode(maestroID)(video)===false){
            console.log("ajout de la video noeud maestro " ,video)
            const FnAdd=db.ref(`maestros/${maestroID}/videos/`);
            await FnAdd.push(video);
            await incrementNbNewVideosMaestro(maestroID);
            //console.log("video ajoutée dans le noeud "+video.youtubeId);
        }else{
            //console.log("vidéo déja présente dans le maestro");
        }
    } 
    return(true);
}

const findVideos=(maestro)=>async(deletedVideos)=>{
    console.log(`Importation de ${maestro.surname} ${maestro.name}`)
    //const ytKey="AIzaSyDjZZJFivBihtQBNWhlY3s8HTci9YJ8vw0";
    const ytKey="AIzaSyCNyquOFjQF8xWA8a6A8hARyyWvblMngjw";
    const req="https://www.googleapis.com/youtube/v3/search?key="+ytKey+"&order=date&maxResults=50&part=snippet&q="+getSearchString(maestro);
    
    let arrayVideos=[];
    console.log(req);
    await axios.get(req).then((response)=>{
        //console.log("response",response['data']['items']);
        const videos=response['data']['items'];

        videos.forEach(videoItem=>{
            if(isNotDeletedVideo(videoItem.id.videoId,deletedVideos)){
                const video=buildVideo(videoItem);
                arrayVideos.push(video);
            }
        })
    }).catch(error=>{
        console.log(error.response);
        return Promise.reject(error.response);
    });
    //console.log("vidéos trouvées",arrayVideos);
    return(arrayVideos);
}

const getSearchString=(maestro)=>{
    let search = (maestro.nickname) ? maestro.surname+"%20"+maestro.nickname+"%20"+maestro.name : maestro.surname+"%20"+maestro.name ;
    if(maestro.homonyme==true)search+=" tango";
    return search;
}

const setNbNewVideosMaestro=(maestroID)=>(nbVideos)=>{
    return new Promise(resolve=>{
        const refFn=db.ref(`maestros-infos/${maestroID}/videosToday/`)
        refFn.set(nbVideos,()=>{
            console.log("passage de "+maestroID+" a "+nbVideos+" videos");
        });
        resolve(true);
    })
}

const incrementNbNewVideosMaestro=(maestroID)=>{
    return new Promise(resolve=>{
        const refFn=db.ref(`maestros-infos/${maestroID}/videosToday`);
        refFn.once("value",async (querySnapshot)=>{
            let nb=querySnapshot.val();
            nb=nb+1;
            console.log("nbvideos "+nb);
            await setNbNewVideosMaestro(maestroID)(nb);
            resolve(true);
        });
    });
}


const isNotDeletedVideo=(idVideo)=>(deletedVideos)=>{
    //test if video is not deleted
    if(deletedVideos.indexOf(idVideo)>-1){
        //la video existe deja
        return false;
    }else{
        return true;
    }
}

const buildVideo=(item)=>{
    const ytId= (item.id.videoId) ? item.id.videoId : item.videoId;

    const video={
        title:item.snippet.title,
        youtubeId:ytId,
        urlImage:item.snippet.thumbnails.high.url,
        type:findType(item),
        valid:true,
        dateAdd:formatDate(new Date()),
        datePublication:item.snippet.publishedAt,
        description:item.snippet.description,
        importUser:"bot",
        topVideo:false,
    };

    return video;
}



const isVideoPresentInGeneralNode=async(video)=>{
    const fnFindGeneral = db.ref("videos/").orderByChild("youtubeId").equalTo(video.youtubeId);
    const snapshotFindInGeneral=await fnFindGeneral.once("value");
    if(snapshotFindInGeneral.exists() ){
        //console.log("video existe dans le general")
        return true;
    }else{
        return false;
    }
}

const isVideoPresentInMaestroNode=(maestroID)=>async(video)=>{
    const refFn=db.ref("maestros/"+maestroID +"/videos").orderByChild("youtubeId").equalTo(video.youtubeId)
    const snapshotExistInNode = await refFn.once("value");
    if (snapshotExistInNode.exists()){
        //la video existe deja
        //console.log("video existe dans le noeud");
        return true
    }else{
        return false;
    }
}



const formatDate=(myDate)=>{
    var mm = myDate.getMonth() + 1; // getMonth() is zero-based
    var dd = myDate.getDate();

    return [myDate.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
            ].join('-');
}

const findType=(item)=>{
    let type="";
    if(item.snippet.title){
        if(item.snippet.title.toLowerCase().indexOf("vals")>-1) type="vals";
        if(item.snippet.title.toLowerCase().indexOf("waltz")>-1) type="vals";
        if(item.snippet.title.toLowerCase().indexOf("milonga")>-1) type="milonga";
        if(item.snippet.title.toLowerCase().indexOf("workshop")>-1) type="lesson";
        if(item.snippet.title.toLowerCase().indexOf("lesson")>-1) type="lesson";
        if(item.snippet.title.toLowerCase().indexOf("class")>-1) type="lesson";
    }

    if(type===""){
        if(item.snippet.description){
        if(item.snippet.description.toLowerCase().indexOf("vals")>-1)type="vals";
        if(item.snippet.description.toLowerCase().indexOf("waltz")>-1)type="vals";
        if(item.snippet.description.toLowerCase().indexOf("milonga")>-1)type="milonga";
        if(item.snippet.description.toLowerCase().indexOf("workshop")>-1)type="lesson";
        if(item.snippet.description.toLowerCase().indexOf("lesson")>-1)type="lesson";
        if(item.snippet.description.toLowerCase().indexOf("class")>-1)type="lesson";
        }
    }

    return type;
}

exports.import=importVideos;
exports.isOkVideo=isNotDeletedVideo;
exports.addVideo=addVideo;
