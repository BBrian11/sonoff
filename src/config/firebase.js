
const firebaseConfig = {
    apiKey: "AIzaSyDYyP_eeGx_NqeAy33Qme1BoUbb2ZJzipg",
    authDomain: "reportesbetapharma.firebaseapp.com",
    projectId: "reportesbetapharma",
    storageBucket: "reportesbetapharma.appspot.com",
    messagingSenderId: "290872825332",
    appId: "1:290872825332:web:948484711f39493aacd5a1",
    measurementId: "G-0WXTV6NP0M"
  };

  var admin = require("firebase-admin");

  var serviceAccount = require("./key.json");
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://reportesbetapharma-default-rtdb.firebaseio.com"
  });

  export const firestore = firebase.firestore();
  export const database = firebase.database();
