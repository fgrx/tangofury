const {db}= require('../config/db.js');
const {firebaseAuth}= require('../config/db.js');

checkConnexion=function (login,password){
    return new Promise(resolve=>{
        firebaseAuth.signInWithEmail(login, password,  function(err, result){
            if (err){
                resolve(false);
            }else{
                resolve(result.user.id);
            }
         });
    });

}

subscribeMaestro= function(maestro,user){
    db.ref(`/userProfile/${user}/maestros/`).push(maestro);
}

unsubscribeMaestro= function(maestro,user){
    db.ref(`/userProfile/${user}/maestros/`).once("value")
    .then((querySnapshot) => {
      querySnapshot.forEach(function (doc) {
        if(doc.val()==maestro){
          db.ref(`/userProfile/${user}/maestros/`).child(doc.key).remove()
        }
      });
    });
}

exports.checkConnexion=checkConnexion;
exports.subscribeMaestro=subscribeMaestro;
exports.unsubscribeMaestro=unsubscribeMaestro;
