const Videos = require("../controllers/videos");

module.exports=(app)=>{

    //Delete video
    app.get('/tango-videos/delete-video/:video/:youtube', (req, res) => {
        console.log("yt",req.params.youtube)
        if(req.session.userKey!=undefined && req.session.userMail==="fab.grignoux@gmail.com"){
            Videos.deleteVideo(req.params.video)(req.params.youtube);
            res.status(200).json({result:"video deleted"})
        }else{
            res.redirect('login?login=false');
        }
    })

    
     //page de videos avec le type
     app.get('/tango-videos/:type/:offset', async (req, res) => { 
        const videos= await Videos.getVideos(null)(req.params.type)(req.params.offset)(24);
        const nbResults=videos.length;
        let role="";
        if(req.session.userKey!=undefined && req.session.userMail==="fab.grignoux@gmail.com")role="admin";
        res.render('videos', { title: req.params.type + " videos", videos: videos,offset:parseInt(req.params.offset)+24,type:req.params.type,nbResults:nbResults,role:role})
    });

    //Change le type de video
    app.get('/tango-videos/change-type/:video/:type', (req, res) => {
        if(req.session.userKey!=undefined && req.session.userMail==="fab.grignoux@gmail.com"){
            const res=Videos.changeVideoType(req.params.video)(req.params.type);
            res.status(200).json({result:"video type changed"})
        }else{
            res.redirect('login?login=false');
        }
    })

    //Set video as top video
    app.get('/tango-videos/set-top/:video/:mode', (req, res) => {
        if(req.session.userKey!=undefined && req.session.userMail==="fab.grignoux@gmail.com"){
            Videos.setTopVideos(req.params.video)(req.params.mode);
            res.status(200).json({result:"video is set as a top video"})
        }else{
            res.redirect('login?login=false');
        }
    })


}