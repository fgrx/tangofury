const express = require('express');
const router = express.Router();
const app = express();
const Videos = require("./models/videos");
const Selections=require("./models/selections");
const Maestros=require("./models/maestros");
const Account=require("./models/account");

// install Helmet et compression
require("./prod")(app);

const bodyParser = require('body-parser')

app.use(express.json());

app.use(bodyParser.urlencoded({extended : true}));

app.set('view engine', 'pug');
app.locals.moment = require('moment');

//Gestions des assets
process.env.PWD = process.cwd()
app.use(express.static(process.env.PWD + '/public'));

app.use(express.static(process.env.PWD + '/node_modules'));

//Page d'accueil
app.get('/', async (req, res) => {
  let topVideos=await Videos.getTopVideos();
  let selections= await Selections.getSelections(6);
  res.render('index', { title: 'Watch the best tango performances',descriptionPage:"Discover new tango videos and maestros every day. Watch all the best tango performances", topVideos: topVideos,selections:selections})
});

//toutes les tops videos
app.get('/top-tango-videos/:offset', async (req, res) => {
  let videos= await Videos.getAllTopVideos(req.params.offset);
  var nbResults=videos.length;
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
  let selections= await Selections.getSelections();
  res.render('selections-list', { title: "All Tango Fury's selections",selections:selections})
});


//page de videos avec le type
app.get('/tango-videos/:type/:offset', async (req, res) => {
  let videos= await Videos.getVideos(null,req.params.type,req.params.offset);
  var nbResults=videos.length;
  res.render('videos', { title: req.params.type + " videos", videos: videos,offset:parseInt(req.params.offset)+24,type:req.params.type,nbResults:nbResults})
});

//Maestros

//page de listing des maestros
app.get('/tango-maestros', async (req, res) => {
  let maestros= await Maestros.getMaestros();
  res.render('maestros-list',{title:"Tango maestros list",maestros:maestros,descriptionPage:"List off all the most famous tango maestros"})
});

//Affichage d'un maestro
app.get('/tango-maestros/:slug/:type/:offset', async (req, res) => {
  let maestro= await Maestros.getMaestro(req.params.slug);
  let videos= await Videos.getVideos(maestro,req.params.type,req.params.offset);
  var typeDisplay=req.params.type;
  if(typeDisplay=="all")typeDisplay="";
  var nbResults=videos.length;
  res.render('maestro',{
    title:maestro.surname+" "+maestro.name ,
    maestro:maestro,videos:videos,
    type:req.params.type,
    typeDisplay:typeDisplay,
    offset:parseInt(req.params.offset)+24,
    nbResults:nbResults,
    descriptionPage:"watch all the best tango videos of "
  })
});


//Page de login
app.get('/login', async (req, res) => {
  var failedLogin=req.query.login;
  res.render('login',{title:"Connexion",failedAuth:failedLogin,descriptionPage:"please login to manage all your playlists and favorites maestros"})
});

//test de connexion
app.post('/connexion', async (req, res) => {
  data=req.body;
  var testConnexion=await Account.checkConnexion(data.login,data.password);

  console.log("testcon",testConnexion);
  if(testConnexion==false){
    res.redirect('login?login=false');
  }else{
    var session = require('express-session');

    var sess = {
      secret: 'keyboard cat',
      cookie: {}
    }

    app.set('trust proxy', 1);
    app.use(session(sess));

    res.redirect('account');
  }
});

//Page de compte
app.get('/account', async (req, res) => {
/*
  if(!req.session.secret){
    res.render('account',{title:"My account"})
  }else{
    res.redirect('login?login=false');
  }
  */
 console.log(req.session);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
