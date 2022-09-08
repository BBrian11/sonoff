
const express = require("express");
const { connection, getDevices } = require("./src/config/ewelink-config.js");
const { createPDF } = require("./src/config/jspdf.js");
const { sendEmail } = require("./src/config/nodemailer.js");
const cron = require("node-cron");

const collectionKey = "devices"; //Nombre de la colecciòn
const app = express();
const fs = require("fs");





app.set("views", "./public/views");
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  let tempArray = [];
  let deviceArray = [];
  let humidityArray = [];
  let devices = await getDevices();
  
  devices.forEach((device)=>{
    tempArray.push(device.params.currentTemperature);
    deviceArray.push(device.name);
    humidityArray.push(device.params.currentHumidity);
  });

  return res.render("index", { devices: devices, tempArray: tempArray, deviceArray: deviceArray, humidityArray: humidityArray });
});

app.post("/enviar-reporte", async (req, res) => {
  return res.render("view", { device: { ...req.body } });
});
const firebase = require('firebase');
      const firebaseConfig = {
        apiKey: "AIzaSyA0SPrVpzWj4_djaMvQLswxboN4WFrh_wg",
  authDomain: "informesbetapharma.firebaseapp.com",
  databaseURL: "https://informesbetapharma-default-rtdb.firebaseio.com",
  projectId: "informesbetapharma",
  storageBucket: "informesbetapharma.appspot.com",
  messagingSenderId: "622037563604",
  appId: "1:622037563604:web:11b948b38f55b1a900e341",
  measurementId: "G-NMGLX5Y50Y"
      };
      firebase.initializeApp(firebaseConfig);

      cron.schedule("*/15 * * * *", async () => {
  await connection.getRegion();

  
  JSON.parse(process.env.DEVICES).forEach(async (device) => {
    const { temperature, ...err } =
      await connection.getDeviceCurrentTemperature(device.id);
    console.log(temperature, err);

    const { humidity } = await connection.getDeviceCurrentHumidity(device.id);
         
                    
    const currentDate = new Date();
        require('firebase/firestore'); // eslint-disable-line global-require
    
         
    const db = firebase.firestore();
     db.collection(collectionKey).add({ device, temperature, humidity, currentDate});
            
        
            console.log("Document " + device.name + " successfully written!");
          
          
      });
      

     });
       
    
 


const PORT = 3000;

app.listen(PORT, () => {
  console.log("Escuchando al puerto", PORT);
});