const Videos = require("./controllers/videos");
const Selections=require("./controllers/selections");
const Maestros=require("./controllers/maestros");
const Account=require("./controllers/account");
const Playlist=require("./controllers/playlists");
const Importer=require("./controllers/importer");


module.exports=(app)=>{

    //Page d'accueil
    app.get('/', async (req, res) => {
        let topVideos=await Videos.getTopVideos();
        let selections= await Selections.getSelections(6);
        let role="";
        if(req.session.userKey!=undefined && req.session.userMail==="fab.grignoux@gmail.com")role="admin";
        
        const topMaestros= (req.session.userKey) ? await Maestros.getTopMaestros(req.session.userKey)('') : [];
        res.render('index', { title: 'Watch the best tango performances',descriptionPage:"Discover new tango videos and maestros every day. Watch all the best tango performances",topMaestros:topMaestros, topVideos: topVideos,selections:selections,role:role})
    });

    //toutes les tops videos
    app.get('/top-tango-videos/:offset', async (req, res) => {
        let videos= await Videos.getAllTopVideos(req.params.offset);
        let nbResults=videos.length;
        res.render('top-videos', { title: "Top tango videos",videos:videos,offset:parseInt(req.params.offset)+24,nbResults:nbResults})
    });

    //Page de séléction

    //une séléction
    app.get('/selection/:key', async (req, res) => {
        let selection= await Selections.getSelectionInfos(req.params.key);
        res.render('selection', { title: 'Tango Fury selection - '+ selection.title, selection: selection})
    });

    //toutes les sélections
        app.get('/selections', async (req, res) => {
        let selections= await Selections.getSelections(0);
        res.render('selections-list', { title: "All Tango Fury's selections",selections:selections})
    });


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
            const result=Videos.changeVideoType(req.params.video)(req.params.type);
            res.send("over");
        }else{
            res.redirect('login?login=false');
        }
    })

    //Set video as top video
    app.get('/tango-videos/set-top/:video/:mode', (req, res) => {
        if(req.session.userKey!=undefined && req.session.userMail==="fab.grignoux@gmail.com"){
            const result=Videos.setTopVideos(req.params.video)(req.params.mode);
            res.send("over");
        }else{
            res.redirect('login?login=false');
        }
    })

    //Delete video
    app.get('/delete-video/:video', (req, res) => {
        if(req.session.userKey!=undefined && req.session.userMail==="fab.grignoux@gmail.com"){
            const result=Videos.deleteVideo(req.params.video);
            res.send("over");
        }else{
            res.redirect('login?login=false');
        }
    })

    //Maestros

    //page de listing des maestros
    app.get('/tango-maestros', async (req, res) => {
        let user="";
        if(req.session.userKey!=undefined)user=req.session.userKey;
        const maestros= await Maestros.getMaestros(user);
        res.render('maestros-list',{title:"Tango maestros list",maestros:maestros,descriptionPage:"List off all the most famous tango maestros"})
        });

        //Affichage d'un maestro
        app.get('/tango-maestros/:slug/:type/:offset', async (req, res) => {
        let user="";
        if(req.session.userKey!=undefined)user=req.session.userKey;
        let maestro= await Maestros.getMaestro(req.params.slug)("")(user);
        const videos= await Videos.getVideos(maestro)(req.params.type)(req.params.offset)(24);
        let typeDisplay=req.params.type;
        if(typeDisplay=="all")typeDisplay="";
        const nbResults=videos.length;
        let role="";
        if(req.session.userKey!=undefined && req.session.userMail==="fab.grignoux@gmail.com")role="admin";
        res.render('maestro',{
            title:maestro.surname+" "+maestro.name ,
            maestro:maestro,videos:videos,
            type:req.params.type,
            typeDisplay:typeDisplay,
            offset:parseInt(req.params.offset)+24,
            nbResults:nbResults,
            descriptionPage:"watch all the best tango videos of ",
            role:role
        })                                                                      
    });


    //Page de login
    app.get('/login', async (req, res) => {
        const failedLogin=req.query.login;
        const page=req.query.page;
        res.render('login',{title:"Connexion",page:page,failedAuth:failedLogin,descriptionPage:"please login to manage all your playlists and favorites maestros"})
    });

        

    //test de connexion
    app.post('/connexion', async (req, res) => {
        data=req.body;
        const UserConnected=await Account.checkConnexion(data.login)(data.password);
        const page=data.page;

        if(UserConnected==false){
            let target="";
            if(page!==undefined && page!="" )target="&page="+page;
            res.redirect('login?login=false'+target);
        }else{
            req.session.userKey=UserConnected.id;
            req.session.userMail=UserConnected.email;
            if(page!==undefined && page!=""){
                res.redirect(page);
            }else{
                res.redirect('account');
            }
            
        }
    });

    //Page de déconnexion
    app.get('/logout',(req,res)=>{
        req.session=null;
        res.redirect('/');
    });

    //Page de compte
    app.get('/account', async (req, res) => {
        if(req.session.userKey!=undefined){
            const playlists=await Playlist.getUserPlaylists(req.session.userKey);
            const topMaestros= await Maestros.getTopMaestros(req.session.userKey)("");
            res.render('account',{title:"My account",playlists:playlists,topMaestros:topMaestros,descriptionPage:"My personnal page"})
        }else{
            res.redirect('login?login=false');
        }
    });

    //compte - ajouter un maestro
    app.get('/account/subscribe/:key', async (req, res) => {
        if(req.session.userKey!=undefined){
            Account.subscribeMaestro(req.params.key,req.session.userKey);
            res.send("over");
        }else{
            res.redirect('login?login=false');
        }
    });

    // compte - enlever un maestro
    app.get('/account/unsubscribe/:key', async (req, res) => {
        if(req.session.userKey!=undefined){
            Account.unsubscribeMaestro(req.params.key,req.session.userKey);
            res.send("over");
        }else{
            res.redirect('login?login=false');
        }
    });



    //page de playlist
    app.get('/playlist/:id', async (req, res) => {
        if(req.session.userKey!=undefined){
            const playlist=await Playlist.getPlaylist(req.session.userKey,req.params.id);
            res.render('playlist',{title:playlist.title,playlist:playlist,descriptionPage:"Playlist page"})
        }else{
            res.redirect('login?login=false');
        }
    });


    //page d'imports
    app.get('/import', async (req, res) => {
        if(req.session.userKey!=undefined && req.session.userMail==="fab.grignoux@gmail.com"){
            const imports=await Importer.import();
            res.render('import',{title:"Videos importation",imports,descriptionPage:"Videos importation"})
        }else{
            res.redirect('login?login=false&page=import');
        }
    });
};