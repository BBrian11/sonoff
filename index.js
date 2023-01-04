const express = require("express");
const { connection, getDevices } = require("./src/config/ewelink-config.js");
const { createPDF } = require("./src/config/jspdf.js");
const { sendEmail } = require("./src/config/nodemailer.js");
const cron = require("node-cron");
const { CronJob } = require('cron');
const firebase = require("firebase");
const {firebaseConfig} = require('./src/config/firebase.js');
const {login} = require("./src/functions/login.js");

const collectionKey = "devices"; //Nombre de la colecciòn

firebase.initializeApp(firebaseConfig);

const app = express();
const fs = require("fs");
const {getDevicesDb, getDevicesDbSorted} = require('./src/functions/getDevicesDb.js');
const {setDevicesDb} = require('./src/functions/setDevicesDb.js');

const xl = require("excel4node");
const path = require("path");
const { logout } = require("./src/functions/logout.js");
const { nextTick } = require("process");

app.set("views", "./public/views");
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const isLogged = (req, res, next)=>{

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log("USUARIO LOGUEADO");
      next();
      //return true;
    } else {
      res.redirect('/login');
      //return false;
    }
});


  /* const user = firebase.auth().currentUser;
  if(user){
    console.log("USUARIO LOGUEADO");
    next();
    return true;
  }else{
    res.redirect('/login');
    return false;
  }  */
}

app.get("/", isLogged, async (req, res) => {
  const user = firebase.auth().currentUser;
  /* if(user){
    console.log("USUARIO LOGUEADO");
  }else{
    console.log("NO HAY USUARIO LOGUEADO");
    res.redirect('/login');
    return;
  }  */
    let tempArray = [];
    let deviceArray = [];
    let humidityArray = [];
    let devices = await getDevices();
    let documentos = await getDevicesDb();
    let arrayData = [];
    let temperaturas1 = [];
    let temperaturasHeladera2 = [];
    let temperaturasHeladera3 = [];
    let temperaturasHeladera4 = [];
    let fechas1 = []
  
    documentos.docs.map((doc) => {
      arrayData.push(doc.data());
    });
  
    arrayData.map((item)=>{
      //console.log(item)
      if(item.device.id == "1001498e4a"){
        temperaturas1.push(item.temperature);
        fechas1.push(item.currentDate.toDate().toLocaleString());
      }
  
      if(item.device.id == "10014989de"){
         temperaturasHeladera2.push(item.temperature);
      }
  
  /*
      if(item.device.id == "1001498a67"){
         temperaturasHeladera3.push(item.temperature);
      }
  
      if(item.device.id == "10014993eb"){
         temperaturasHeladera4.push(item.temperature);
      }*/
   })
  
  
    devices.forEach((device) => {
      tempArray.push(device.params.currentTemperature);
      deviceArray.push(device.name);
      humidityArray.push(device.params.currentHumidity);
    });
  
    return res.render("index", {
      devices: devices,
      tempArray: tempArray,
      deviceArray: deviceArray,
      humidityArray: humidityArray,
      historicDevices: arrayData,
      temperaturas1: temperaturas1,
      temperaturasHeladera2: temperaturasHeladera2,
      temperaturasHeladera3: temperaturasHeladera3,
      temperaturasHeladera4: temperaturasHeladera4,
      fechas1: fechas1,
      user: user.email
    }); 
});

app.get('/login', (req, res)=>{
  const user = firebase.auth().currentUser;
  if(user){
    res.redirect('/');
  }else{
    res.render('login', {error: false});
  }
})

app.post('/login', async(req, res)=>{
  const {email, password} = req.body;
  await login(email, password, res);
  //console.log(await login(email, password));
})

app.get('/logout', async(req, res)=>{
  await logout(res);
})

app.post("/enviar-reporte", async (req, res) => {
  return res.render("view", { device: { ...req.body } });
});

app.get("/excel", async (req, res) => {
  let arrayTemperaturas = [];
  let documentos = await getDevicesDb();
  let arrayData = [];
  let tempMin = 0;
  let tempMax = 0;

  documentos.docs.map((doc) => {
    arrayData.push(doc.data());
  });

  let excelData;

  if(req.query.device == 'Heladera 1'){
    excelData = arrayData.filter(item=>item.device.name=='Heladera 1');
  }else if(req.query.device == 'Heladera 2'){
    excelData = arrayData.filter(item=>item.device.name=='Heladera 2');
  }else{
    excelData = arrayData;
  }

  excelData.map((doc) => {
      arrayTemperaturas.push(doc.temperature);
  });

  let arrayTempFiltrado = arrayTemperaturas.filter(temp=>temp != 'unavailable');

  let arrayTempNumber = arrayTempFiltrado.map(Number);

  /* tempMin = Math.min(Number(arrayTempFiltrado));
  tempMax = Math.max(Number(arrayTempFiltrado)); */

  arrayTempNumber.map((temp, index) => {
    if (index === 0 && temp != 'unavailable') {
      tempMin = temp;
    }
    if (temp > tempMax && temp != 'unavailable') {
      tempMax = temp;
    }
    if (temp < tempMin && temp != 'unavailable') {
      tempMin = temp;
    }
  });

  console.log("Temp min: ", tempMin);
  console.log("Temp max: ", tempMax);

  // excel generator
  let libro = new xl.Workbook();
  let hoja = libro.addWorksheet("Reportes");

  let style = libro.createStyle({
    font: {
      color: "#000000",
      size: 12,
    },
  });

  hoja.cell(1, 1).string("Fecha y hora").style(style);
  hoja.cell(1, 2).string("Nombre del dispositivo").style(style);
  hoja.cell(1, 3).string("Temperatura registrada").style(style);

  hoja.cell(1, 5).string("Temperatura máxima general").style(style);
  hoja.cell(1, 6).string(`${tempMax} °C`).style(style);

  hoja.cell(1, 7).string("Temperatura mínima general").style(style);
  hoja.cell(1, 8).string(`${tempMin} °C`).style(style);

  hoja.column(1).setWidth(19);
  hoja.column(2).setWidth(19);
  hoja.column(3).setWidth(20);
  hoja.column(5).setWidth(25);
  hoja.column(7).setWidth(24);

  const devices = await getDevicesDbSorted();

  excelData.map((doc, index) => {
    hoja
      .cell(index + 2, 1)
      .string(doc.currentDate.toDate().toLocaleString())
      .style(style);
    hoja
      .cell(index + 2, 2)
      .string(doc.device.name)
      .style(style);
    hoja
      .cell(index + 2, 3)
      .string(`${doc.temperature} °C`)
      .style(style);
  });

  const pathExcel = path.join(
    __dirname,
    "/public/files/excel",
    `Reporte_${new Date().getUTCDate()}-${
      new Date().getMonth() + 1
    }-${new Date().getUTCFullYear()}_${new Date().getHours()}-${new Date().getMinutes()}.xlsx`
  );

  libro.write(pathExcel, function (err, stats) {
    if (err) {
      console.log(err);
    } else {
      function downloadFile() {
        res.download(pathExcel);
      }
      downloadFile();
      return false;
    }
  });
});

//cron.schedule("*/15 * * * *", async () => {
//  await setDevicesDb();
//});

const job = new CronJob("*/15 * * * *", async()=> {
  await setDevicesDb();
});

job.start();

const PORT = 3001;

app.listen(PORT, () => {
  console.log("Escuchando al puerto", PORT);
});
