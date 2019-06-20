const {db}= require('../config/db.js');

async function getMaestros(){
    var arr=[];
    await db.ref(`/maestros-infos`).once("value", async (querySnapshot) => {
        querySnapshot.forEach(function (doc) { 
            maestro=doc.val();
            var imageClear=doc.child("image").val().replace("2018/03/","").replace("2018/04/","").replace("/","");
            maestro.urlImage="https://firebasestorage.googleapis.com/v0/b/tango-videos-2ce36.appspot.com/o/maestros%2F"+imageClear+"?alt=media";
            maestro.videos=doc.child("videos").val();
            arr.push(maestro);
          });
      });

    return arr;
}

async function getMaestro(slug){
    var maestro;
    await db.ref(`/maestros-infos`).orderByChild('slug').equalTo(slug).once("value", async(querySnapshot) => {
        querySnapshot.forEach(function (doc) {
            maestro=doc.val();
            maestro.key=doc.key;
            var imageClear=doc.child("image").val().replace("2018/03/","").replace("2018/04/","").replace("/","");
            maestro.imageUrl="https://firebasestorage.googleapis.com/v0/b/tango-videos-2ce36.appspot.com/o/maestros%2F"+imageClear+"?alt=media";;
            });
        }
    );
    return(maestro);
}

exports.getMaestros = getMaestros;
exports.getMaestro = getMaestro;