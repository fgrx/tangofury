const {db}= require('../config/db.js');
const {firebaseAuth}= require('../config/db.js');

checkConnexion=(login)=>(password)=>{
    return new Promise(resolve=>{
      firebaseAuth.signInWithEmail(login, password,  (err, result)=>resolve((err)?false:result.user));
    });
}

subscribeMaestro= (maestro)=>(user)=>db.ref(`/userProfile/${user}/maestros/`).push(maestro);

unsubscribeMaestro= (maestro)=>(user)=>{
    db.ref(`/userProfile/${user}/maestros/`).once("value")
    .then((querySnapshot) => {
      querySnapshot.forEach(doc=>{
        if(doc.val()==maestro){
          return db.ref(`/userProfile/${user}/maestros/`).child(doc.key).remove()
        }
      });
    });
}

exports.checkConnexion=checkConnexion;
exports.subscribeMaestro=subscribeMaestro;
exports.unsubscribeMaestro=unsubscribeMaestro;
