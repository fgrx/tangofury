const firebase = require("firebase-admin");
const {Storage} = require('@google-cloud/storage');
const FirebaseAuth = require('firebaseauth');

// Initialisation de firebase
var serviceAccount = require("./serviceAccountKey.json");

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://tango-videos-2ce36.firebaseio.com",
    storageBucket:"tango-videos-2ce36.appspot.com"
});

const db = firebase.database(); 

const storage = new Storage({
    projectId: "tango-videos-2ce36",
    keyFilename: "./serviceAccountKey.json"
});


const bucket=storage.bucket("tango-videos-2ce36.appspot.com");

const firebaseAuth = new FirebaseAuth("**********");

exports.db = db;
exports.firebaseAuth= firebaseAuth;
exports.storage=bucket;
exports.firebase=firebase;

