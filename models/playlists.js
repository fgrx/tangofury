const {db}= require('../config/db.js');

getUserPlaylists=async function(user){
    var playlists=[];
    ref = db.ref("/userProfile/"+user.key+"/playlists/");
   
    await ref.once("value", async function(snapshot) {
        snapshot.forEach((snap)=>{
            let playlist=snap.val();
            playlist.key=snap.key;
            playlist.nbVideos=Object.keys(selection.videos).length;
            playlists.push(selection);
        });
    }); 

    return playlists.reverse();
}