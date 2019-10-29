const {db}= require('../config/db.js');

const getTopMaestros=(user)=>async(mode)=>{
    let arrIndex=[];
    let arr=[];

    const req="/userProfile/"+user+"/maestros";
    await db.ref(req).once("value", async (querySnapshot) => {
        querySnapshot.forEach(doc=>{ 
            let maestro=doc.val();
            arrIndex.push(maestro);
        });
    });

    if(mode=="key"){
        return arrIndex;
    }else{
    await Promise.all(
        arrIndex.map(async(index)=>{
            let maestro=await getMaestro("")(index)("");
            maestro.favorite=true;
            arr.push(maestro);
        })
    );

        return arr.sort((a,b)=>a.videosToday > b.videosToday).reverse();
    }
}


const getMaestros=async(user="")=>{
    let arr=[];
    let arrIndexTop=[];

    if(user!=""){
        arrIndexTop= await getTopMaestros(user)("key");
    }

    
    const maestrosRef= db.ref(`/maestros-infos`).orderByChild("videosToday");
    const snapshot=await maestrosRef.once('value');
    snapshot.forEach(doc=>{
        let maestro=doc.val();
        const imageClear=doc.child("image").val().replace("2018/03/","").replace("2018/04/","").replace("/","");
        maestro.urlImage="https://firebasestorage.googleapis.com/v0/b/tango-videos-2ce36.appspot.com/o/maestros%2F"+imageClear+"?alt=media";
        maestro.videos=doc.child("videos").val();
            
        user ? maestro.favorite=false : maestro.favorite="noconnexion";
            
        maestro.key=doc.key;
        
        arrIndexTop.forEach(index=>{
            if(index==maestro.key)maestro.favorite=true;
        });
        arr.push(maestro);
    });

    return arr.reverse();
}

const getMaestro=(slug)=>(key)=>async(user)=>{
    let maestro;

    if(slug!=""){
        const maestroRef=db.ref(`/maestros-infos`).orderByChild('slug').equalTo(slug);
        const snapShot=await maestroRef.once("value");
        snapShot.forEach(doc=>{
            maestro=doc.val();
            maestro.key=doc.key;
            if(maestro.nickname==undefined)maestro.nickname="";
            const imageClear=doc.child("image").val().replace("2018/03/","").replace("2018/04/","").replace("/","");
            maestro.urlImage="https://firebasestorage.googleapis.com/v0/b/tango-videos-2ce36.appspot.com/o/maestros%2F"+imageClear+"?alt=media";
        })
    }

    if(key!=""){
        const maestroRef=db.ref(`/maestros-infos`).orderByChild('slug').equalTo(slug);
        const snapShot=await maestroRef.once("value");
        snapShot.forEach(querySnapshot=>{
            maestro=querySnapshot.val();
            maestro.key=querySnapshot.key;
            const imageClear=maestro.image.replace("2018/03/","").replace("2018/04/","").replace("/","");
            maestro.urlImage="https://firebasestorage.googleapis.com/v0/b/tango-videos-2ce36.appspot.com/o/maestros%2F"+imageClear+"?alt=media";
        });
    }
    
    user ? maestro.favorite=false : maestro.favorite="noconnexion";

    if(user!=""){
        let arrIndexTop= await getTopMaestros(user)("key");
        arrIndexTop.forEach(index=>{
            if(index==maestro.key){
                maestro.favorite=true;
            }
        });
    }
    return (maestro);
}

module.exports={
    getTopMaestros,
    getMaestros,
    getMaestro
}