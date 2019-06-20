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

exports.checkConnexion=checkConnexion;
