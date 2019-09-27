const {db}= require('../config/db.js');
const Maestros=require("./maestros");
const Videos=require('./videos');
const axios = require("axios");


async function importVideos(){
    //Récupère la liste des maestros
    const maestros= await Maestros.getMaestros();

    const deletedVideos=await Videos.getDeletedVideos();

    maestros.map(async(maestro)=>{
        //if(maestro.key=="PO25e78zbd"){
            await setNbNewVideosMaestro(maestro.key,0);
            await findVideos(maestro,deletedVideos);
        //}
    });
    

    return "Done !";
}

function findVideos(maestro,deletedVideos){
    return new Promise(async(resolve)=>{
        console.log(`Importation de ${maestro.surname} ${maestro.name}`)
        //const ytKey="AIzaSyDjZZJFivBihtQBNWhlY3s8HTci9YJ8vw0";
        const ytKey="AIzaSyCNyquOFjQF8xWA8a6A8hARyyWvblMngjw";
        const req="https://www.googleapis.com/youtube/v3/search?key="+ytKey+"&order=date&maxResults=50&part=snippet&q="+getSearchString(maestro);
        
        await axios.get(req).then(async (response)=>{
            //console.log("response",response['data']['items']);
            for(const item of response['data']['items']){
                if(isOkVideo(item.id.videoId,deletedVideos)){
                    //console.log("ok video",item);
                    const video=buildVideo(item);
                    console.log("preparation ajout "+video.youtubeId)
                    const testAddVideo=await addVideo(video,maestro.key);
                }
            }
        });
        resolve(true);
    });
}

function getSearchString(maestro){
    let search = (maestro.nickname) ? maestro.surname+" "+maestro.nickname+" "+maestro.name : maestro.surname+" "+maestro.name ;
    if(maestro.homonyme==true)search+=" tango";
    return search;
}

function setNbNewVideosMaestro(maestroID,nbVideos){
    return new Promise(resolve=>{
        const refFn=db.ref(`maestros-infos/${maestroID}/videosToday/`)
        const snap=refFn.set(nbVideos,(snap)=>{
            console.log("passage de "+maestroID+" a "+nbVideos+" videos");
            resolve(snap);
        });
    })
}

function incrementNbNewVideosMaestro(maestroID){
    return new Promise(resolve=>{
        const refFn=db.ref(`maestros-infos/${maestroID}/videosToday`);
        refFn.once("value",async (querySnapshot)=>{
            let nb=querySnapshot.val();
            nb=nb+1;
            console.log("nbvideos "+nb);
            await setNbNewVideosMaestro(maestroID,nb);
            resolve(true);
        });
    });
}


function isOkVideo(idVideo,deletedVideos){
    //test if video is not deleted
    if(deletedVideos.indexOf(idVideo)>-1){
        //la video existe deja
        return false;
    }else{
        return true;
    }
}

function buildVideo(item){
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


async function addVideo(video,maestroID){
    return new Promise(async(resolve) => {
        //construction of the video
        console.log("ingestion de la video ?"+ video.title +" "+video.youtubeId);
        if(video.youtubeId){
            // Adding video to the general node
            const fnFindGeneral = db.ref("videos/").orderByChild("youtubeId").equalTo(video.youtubeId);
            const snapshotFindInGeneral=await fnFindGeneral.once("value");
            if (snapshotFindInGeneral.exists()){
                //la video existe deja
                console.log("video existe dans le general")
            }else{
                //la video n'existe pas, on ingère
                const fnAddGeneral = db.ref(`videos/`)
                snapAddGeneral = await fnAddGeneral.push(video)
                console.log("video ajoutée dans le général "+video.youtubeId);
            }


            //Adding the video to the maestro node
            const refFn=db.ref("maestros/"+maestroID +"/videos").orderByChild("youtubeId").equalTo(video.youtubeId)
            const snapshotExistInNode = await refFn.once("value");
            if (snapshotExistInNode.exists()){
                //la video existe deja
                console.log("video existe dans le noeud");
            }else{
                //la video n'existe pas, on ingère
                console.log("ajout de la video noeud maestro " ,video)
                const FnAdd=db.ref(`maestros/${maestroID}/videos/`);
                const snapNode=await FnAdd.push(video);
                const increment = await incrementNbNewVideosMaestro(maestroID);
                console.log("video ajoutée dans le noeud "+video.youtubeId);
            }
        } 
        resolve(true);
    });
}



function formatDate(myDate){
    var mm = myDate.getMonth() + 1; // getMonth() is zero-based
    var dd = myDate.getDate();

    return [myDate.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
            ].join('-');
}

function findType(item){
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
exports.isOkVideo=isOkVideo;
exports.addVideo=addVideo;
