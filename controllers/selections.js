const {db}= require('../config/db.js');

const getSelections=async(limit)=>{

    let selections=[];
    let ref="";

    if(limit>0){
        ref = db.ref("/userProfile/NbtwzggJpfYmu1rN4lqdCNBBSVu1/playlists/").orderByChild("selection").equalTo(true).limitToLast(limit);
    }else{
        ref = db.ref("/userProfile/NbtwzggJpfYmu1rN4lqdCNBBSVu1/playlists/").orderByChild("selection").equalTo(true);
    }


    await ref.once("value", async function(snapshot) {
        snapshot.forEach((snap)=>{
            let selection=snap.val();
            selection.imageUrl="https://firebasestorage.googleapis.com/v0/b/tango-videos-2ce36.appspot.com/o/selections%2F"+selection.image+"?alt=media";
            selection.key=snap.key;
            selection.nbVideos=Object.keys(selection.videos).length;
            selections.push(selection);
        });
    }); 

    return selections.reverse();
}

const getSelectionInfos=async(key)=>{
    const ref = db.ref("/userProfile/NbtwzggJpfYmu1rN4lqdCNBBSVu1/playlists/"+key);
    let selection=[];

    await ref.once("value", async function(snapshot) {
        selection=snapshot.val();
        selection.nbVideos=Object.keys(selection.videos).length;
        selection.imageUrl="https://firebasestorage.googleapis.com/v0/b/tango-videos-2ce36.appspot.com/o/selections%2F"+selection.image+"?alt=media";
    }); 

    return selection;
}


exports.getSelections = getSelections;
exports.getSelectionInfos = getSelectionInfos;