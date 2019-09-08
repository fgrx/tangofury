const Maestros=require("../controllers/maestros");

module.exports=(app)=>{

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
}