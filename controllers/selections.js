const {db}= require('../config/db.js');

getSelections=async(limit)=>{

    let selections=[];

    if(limit>0){
        var ref = db.ref("/userProfile/NbtwzggJpfYmu1rN4lqdCNBBSVu1/playlists/").orderByChild("selection").equalTo(true).limitToLast(limit);
    }else{
        var ref = db.ref("/userProfile/NbtwzggJpfYmu1rN4lqdCNBBSVu1/playlists/").orderByChild("selection").equalTo(true);
    }

    await ref.once("value", async function(snapshot) {
        snapshot.forEach((snap)=>{
            selection=snap.val();
            selection.imageUrl="https://firebasestorage.googleapis.com/v0/b/tango-videos-2ce36.appspot.com/o/selections%2F"+selection.image+"?alt=media";
            selection.key=snap.key;
            selection.nbVideos=Object.keys(selection.videos).length;
            selections.push(selection);
        });
    }); 

    return selections.reverse();
}

getSelectionInfos=async(key)=>{
    let ref = db.ref("/userProfile/NbtwzggJpfYmu1rN4lqdCNBBSVu1/playlists/"+key);
    var selection=[];

    await ref.once("value", async function(snapshot) {
        selection=snapshot.val();
        selection.nbVideos=Object.keys(selection.videos).length;
        selection.imageUrl="https://firebasestorage.googleapis.com/v0/b/tango-videos-2ce36.appspot.com/o/selections%2F"+selection.image+"?alt=media";
    }); 

    return selection;
}


exports.getSelections = getSelections;
exports.getSelectionInfos = getSelectionInfos;