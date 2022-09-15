const express = require("express");
const { connection, getDevices } = require("./src/config/ewelink-config.js");
const { createPDF } = require("./src/config/jspdf.js");
const { sendEmail } = require("./src/config/nodemailer.js");
const cron = require("node-cron");
const firebase = require("firebase");
const {firebaseConfig} = require('./src/config/firebase.js');

const collectionKey = "devices"; //Nombre de la colecciòn

firebase.initializeApp(firebaseConfig);

const app = express();
const fs = require("fs");
const {getDevicesDb, getDevicesDbSorted} = require('./src/functions/getDevicesDb.js');
const {setDevicesDb} = require('./src/functions/setDevicesDb.js');

const xl = require("excel4node");
const path = require("path");

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
  });
});

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

  arrayData.map((doc) => {
      arrayTemperaturas.push(doc.temperature);
  });

  let arrayTempFiltrado = arrayTemperaturas.filter(temp=>temp != 'unavailable');

  let arrayTempNumber = arrayTempFiltrado.map(Number);

  console.log(arrayTempNumber); 

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

  hoja.column(1).setWidth(16);
  hoja.column(2).setWidth(19);
  hoja.column(3).setWidth(20);
  hoja.column(5).setWidth(25);
  hoja.column(7).setWidth(24);

  const devices = await getDevicesDbSorted();

  devices.map((doc, index) => {
    if (index === 0) {
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
        .string(doc.temperature)
        .style(style);
    } else {
      hoja
        .cell(index + 1, 1)
        .string(doc.currentDate.toDate().toLocaleString())
        .style(style);
      hoja
        .cell(index + 1, 2)
        .string(doc.device.name)
        .style(style);
      hoja
        .cell(index + 1, 3)
        .string(`${doc.temperature} °C`)
        .style(style);
    }
    //console.log(doc.currentDate.toDate());
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

app.get("pdf", async(req, res)=>{

})

cron.schedule("*/15 * * * *", async () => {
  await setDevicesDb();
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log("Escuchando al puerto", PORT);
});
