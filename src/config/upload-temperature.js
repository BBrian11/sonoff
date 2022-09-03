const admin = require('firebase-admin');
const serviceAccount = require("./key.json");
const data = require("./devices.json");
const collectionKey = "devices"; //Nombre de la colecciòn


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://reportesbetapharma-default-rtdb.firebaseio.com"
  });
  const firestore = admin.firestore();
  const settings = {timestampsInSnapshots: true};
  firestore.settings(settings);
  if (data && (typeof data === "object")) {
  Object.keys(data).forEach(docKey => {
   firestore.collection(collectionKey).doc(docKey).set(data[docKey]).then((res) => {
      console.log("Document " + docKey + " successfully written!");
  }).catch((error) => {
     console.error("Error writing document: ", error);
  });
  });
  }