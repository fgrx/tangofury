const express = require('express');
const app = express();

// install Helmet et compression
require("./prod")(app);

const bodyParser = require('body-parser');

//Gestion des sessions
var cookieSession = require('cookie-session');
app.set('trust proxy', 1);
app.use(cookieSession({
  name: 'furiaSession',
  keys: ['key1', 'key2']
}))

//Gestions des assets
process.env.PWD = process.cwd()
app.use(express.static(process.env.PWD + '/public', { maxAge: 2592000000 }));

//Accès aux modules pour l'import bulma
app.use(express.static(process.env.PWD + '/node_modules', { maxAge: 2592000000 }));

app.use(express.json());

app.use(bodyParser.urlencoded({extended : true}));

app.set('view engine', 'pug');
app.locals.moment = require('moment');

//Insertion du routing
require('./routes/generalRouter.js')(app);
require('./routes/accountRouter.js')(app);
require('./routes/maestrosRouter.js')(app);
require('./routes/selectionsRouter.js')(app);
require('./routes/videosRouter.js')(app);
require('./routes/playlistsRouter.js')(app);

const port = process.env.PORT || 3007;
app.listen(port, () => console.log(`Listening on port ${port}...`));
