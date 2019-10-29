const Account=require("../controllers/account");
const Playlist=require("../controllers/playlists");
const Maestros=require("../controllers/maestros");

module.exports=(app)=>{

    //Page de login
    app.get('/login', async (req, res) => {
        const failedLogin=req.query.login;
        const page=req.query.page;
        res.render('login',{title:"Connexion",page:page,failedAuth:failedLogin,descriptionPage:"please login to manage all your playlists and favorites maestros"})
    });

        

    //test de connexion
    app.post('/connexion', async (req, res) => {
        const data=req.body;
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
            Account.subscribeMaestro(req.params.key)(req.session.userKey);
            res.send("over");
        }else{
            res.redirect('login?login=false');
        }
    });

    // compte - enlever un maestro
    app.get('/account/unsubscribe/:key', async (req, res) => {
        if(req.session.userKey!=undefined){
            Account.unsubscribeMaestro(req.params.key)(req.session.userKey);
            res.send("over");
        }else{
            res.redirect('login?login=false');
        }
    });
}