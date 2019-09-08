const {db}= require('../config/db.js');

getUserPlaylists=async(userId)=>{
    let playlists=[];
    ref = db.ref("/userProfile/"+userId+"/playlists/");
   
    await ref.once("value", async function(snapshot) {
        snapshot.forEach((snap)=>{
            let playlist=snap.val();
            playlist.key=snap.key;
            playlist.nbVideos=Object.keys(playlist.videos).length;
            playlists.push(playlist);
        });
    }); 

    return playlists.reverse();
}

getPlaylist= (user)=>async(key)=>{
    ref = db.ref("/userProfile/"+user+"/playlists/"+key);
    var playlist=[];

    await ref.once("value", async function(snapshot) {
        playlist=snapshot.val();
        playlist.nbVideos=Object.keys(playlist.videos).length;
    }); 

    return playlist;
}

exports.getUserPlaylists = getUserPlaylists;
exports.getPlaylist = getPlaylist;