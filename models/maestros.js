const {db}= require('../config/db.js');

async function getMaestros(user=""){
    var arr=[];
    var arrIndexTop=[];

    if(user!=""){
        arrIndexTop= await getTopMaestros(user,"key");
    }
    //console.log("arrIndexTop",arrIndexTop);
    await db.ref(`/maestros-infos`).once("value", async (querySnapshot) => {
        querySnapshot.forEach(function (doc) { 
            maestro=doc.val();
            var imageClear=doc.child("image").val().replace("2018/03/","").replace("2018/04/","").replace("/","");
            maestro.urlImage="https://firebasestorage.googleapis.com/v0/b/tango-videos-2ce36.appspot.com/o/maestros%2F"+imageClear+"?alt=media";
            maestro.videos=doc.child("videos").val();
            
            user ? maestro.favorite=false : maestro.favorite="noconnexion";
            
            maestro.key=doc.key;
         
            arrIndexTop.forEach(index=>{
                if(index==maestro.key){
                    maestro.favorite=true;
                }
            });
            arr.push(maestro);
        });
    });
    return arr;
}

async function getTopMaestros(user,mode=""){
    var arrIndex=[];
    var arr=[];

    const req="/userProfile/"+user+"/maestros";
    await db.ref(req).once("value", async (querySnapshot) => {
        querySnapshot.forEach(function (doc) { 
            var maestro=doc.val();
            arrIndex.push(maestro);
        });
    });

    if(mode=="key"){
        return arrIndex;
    }else{
        for (let index of arrIndex) {
            //console.log("index",index)
            let maestro=await getMaestro("",index);
            maestro.favorite=true;
            //console.log("maestro:",maestro);
            arr.push(maestro);
        }

        return arr;
    }
}


async function getMaestro(slug="",key="",user=''){
    var maestro;
    

    if(slug!=""){
        await db.ref(`/maestros-infos`).orderByChild('slug').equalTo(slug).once("value", async(querySnapshot) => {
            querySnapshot.forEach(function (doc) {
                maestro=doc.val();
                maestro.key=doc.key;
                var imageClear=doc.child("image").val().replace("2018/03/","").replace("2018/04/","").replace("/","");
                maestro.urlImage="https://firebasestorage.googleapis.com/v0/b/tango-videos-2ce36.appspot.com/o/maestros%2F"+imageClear+"?alt=media";;
                });
            }
        );
    }

    if(key!=""){
        await db.ref("/maestros-infos/"+key).once("value", querySnapshot => {
                maestro=querySnapshot.val();
                maestro.key=querySnapshot.key;
                var imageClear=maestro.image.replace("2018/03/","").replace("2018/04/","").replace("/","");
                maestro.urlImage="https://firebasestorage.googleapis.com/v0/b/tango-videos-2ce36.appspot.com/o/maestros%2F"+imageClear+"?alt=media";
            }
        );
    }
    
    user ? maestro.favorite=false : maestro.favorite="noconnexion";

    if(user!=""){
        arrIndexTop= await getTopMaestros(user,"key");
        arrIndexTop.forEach(index=>{
            if(index==maestro.key){
                maestro.favorite=true;
            }
        });
    }
    return(maestro);
}

exports.getMaestros = getMaestros;
exports.getMaestro = getMaestro;
exports.getTopMaestros= getTopMaestros;