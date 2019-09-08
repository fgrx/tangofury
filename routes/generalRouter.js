const Importer=require("../controllers/importer");
const Maestros=require("../controllers/maestros");
const Videos=require("../controllers/videos");
const Selections=require("../controllers/selections");

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