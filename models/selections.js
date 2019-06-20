const {db}= require('../config/db.js');

getSelections=async function(limit=0){
    var selections=[];
    ref = db.ref("/userProfile/NbtwzggJpfYmu1rN4lqdCNBBSVu1/playlists/").orderByChild("selection").equalTo(true)
    
    if(limit>0){
        ref.limitToLast(6);
    }
   
    await ref.once("value", async function(snapshot) {
        snapshot.forEach((snap)=>{
            selection=snap.val();
            selection.imageUrl="https://firebasestorage.googleapis.com/v0/b/tango-videos-2ce36.appspot.com/o/selections%2F"+selection.image+"?alt=media";
            selection.key=snap.key;
            selections.push(selection);
        });
    }); 

    return selections.reverse();
}

getSelectionInfos=async function(key){
    ref = db.ref("/userProfile/NbtwzggJpfYmu1rN4lqdCNBBSVu1/playlists/"+key);
    var selection=[];

    await ref.once("value", async function(snapshot) {
        selection=snapshot.val();
        selection.imageUrl="https://firebasestorage.googleapis.com/v0/b/tango-videos-2ce36.appspot.com/o/selections%2F"+selection.image+"?alt=media";
    }); 

    return selection;
}





exports.getSelections = getSelections;
exports.getSelectionInfos = getSelectionInfos;