const {db}= require('../config/db.js');
const Maestros=require("./maestros");
const Videos=require('./videos');
const axios = require("axios");


const importVideos=async()=>{
    //Récupère la liste des maestros
    const maestros= await Maestros.getMaestros();

    const deletedVideos=await Videos.getDeletedVideos();

    maestros.forEach(async(maestro)=>{
        //if(maestro.key=="-LVN9tLFTPpJinqm6lqx" || maestro.key=="-LVN9tLAyhD-V-izb4W7" || maestro.key=="-LVN9tKxhFigIrxT3Y8t" || maestro.key==="-LVN9tL05d1UbmaCY1_X"){
            await setNbNewVideosMaestro(maestro.key)(0);
            const videos = await findVideos(maestro)(deletedVideos);
            await addVideos(maestro.key)(videos);        
        //}
    });
    
    return "done!";
}

const addVideos=(maestroId)=>(videos)=>videos.map(async(video)=>await addVideo(video)(maestroId));

const addVideo=(video)=>async(maestroID)=>{
    //construction of the video
    if(video.youtubeId){
        // Adding video to the general node
        //console.log("ingestion de la video ?"+ video.title +" "+video.youtubeId);
        if(isVideoPresentInGeneralNode(video.youtubeId)===false){
            const fnAddGeneral = db.ref(`videos/`)
            await fnAddGeneral.push(video)
            console.log("video ajoutée dans le général "+video.title);
        }else{
            console.log("vidéo déja présente dans le général"+video.title);
        }

        //Adding the video to the maestro node
        if(isVideoPresentInMaestroNode(maestroID)(video.youtubeId)===false){
            const FnAdd=db.ref(`maestros/${maestroID}/videos/`);
            await FnAdd.push(video);
            await incrementNbNewVideosMaestro(maestroID);
            console.log("video ajoutée dans le noeud "+video.title);
        }else{
            console.log("vidéo déja présente dans le maestro"+video.title);
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
    console.log("request",req);
   
    try{
        const response= await axios.get(req);
        //console.log("response",response['data']['items']);
        const videos=response['data']['items'];

        videos.forEach(videoItem=>{
            if(isNotDeletedVideo(videoItem.id.videoId,deletedVideos)){
                const video=buildVideo(videoItem);
                arrayVideos.push(video);
            }
        })
    }catch(error){
        if (error.response) {
            /*
             * The request was made and the server responded with a
             * status code that falls out of the range of 2xx
             */
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
        } else if (error.request) {
            /*
             * The request was made but no response was received, `error.request`
             * is an instance of XMLHttpRequest in the browser and an instance
             * of http.ClientRequest in Node.js
             */
            console.log(error.request);
        } else {
            // Something happened in setting up the request and triggered an Error
            console.log('Error', error.message);
        }
    }
    
    //console.log("vidéos trouvées",arrayVideos);
    return(arrayVideos);
}

const getSearchString=(maestro)=>{
    let search = (maestro.nickname) ? maestro.surname+"%20"+maestro.nickname+"%20"+maestro.name : maestro.surname+"%20"+maestro.name ;
    if(maestro.homonyme==true)search+="%20tango";
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

function isokfunc(){
    return true;
}

const isVideoPresentInGeneralNode=async(videoYoutubeID)=>{
    const fnFindGeneral = db.ref("videos/").orderByChild("youtubeId").equalTo(videoYoutubeID);
    const snapshotFindInGeneral=await fnFindGeneral.once("value");
    if(snapshotFindInGeneral.exists() )return true;
    return false;
}

const isVideoPresentInMaestroNode=(maestroID)=>async(videoYoutubeID)=>{
    const refFn=db.ref("maestros/"+maestroID +"/videos").orderByChild("youtubeId").equalTo(videoYoutubeID)
    const snapshotExistInNode = await refFn.once("value");
    if (snapshotExistInNode.exists())return true;
    return false;
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

module.exports = {
    importVideos,
    isOkVideo:isNotDeletedVideo,
    addVideo,
    isVideoPresentInGeneralNode,
    isokfunc
}