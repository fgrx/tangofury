const Playlist=require("../controllers/playlists");
module.exports=(app)=>{
        //page de playlist
        app.get('/playlist/:id', async (req, res) => {
            if(req.session.userKey!=undefined){
                const playlist=await Playlist.getPlaylist(req.session.userKey,req.params.id);
                res.render('playlist',{title:playlist.title,playlist:playlist,descriptionPage:"Playlist page"})
            }else{
                res.redirect('login?login=false');
            }
        });
}