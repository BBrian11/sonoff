const express = require("express");
const { connection, getDevices } = require("./src/config/ewelink-config.js");
const { createPDF } = require("./src/config/jspdf.js");
const { sendEmail } = require("./src/config/nodemailer.js");
const cron = require("node-cron");
const admin = require("firebase-admin");
const serviceAccount = require("./src/config/key.json");
const data = require("./src/config/devices.json");
const collectionKey = "devices"; //Nombre de la colecciòn
const app = express();
const fs = require("fs");

app.set("views", "./public/views");
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  let devices = await getDevices();

  return res.render("index", { devices: devices });
});

app.post("/enviar-reporte", async (req, res) => {
  return res.render("view", { device: { ...req.body } });
});

cron.schedule("*/15 * * * *", async () => {
  await connection.getRegion();

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://reportesbetapharma-default-rtdb.firebaseio.com",
  });

  const firestore = admin.firestore();
  const settings = { timestampsInSnapshots: true };
  firestore.settings(settings);

  JSON.parse(process.env.DEVICES).forEach(async (device) => {
    const { temperature, ...err } =
      await connection.getDeviceCurrentTemperature(device.id);
    console.log(temperature, err);

    const { humidity } = await connection.getDeviceCurrentHumidity(device.id);

    data.forEach((device) => {
      const currentDate = new Date();
      const day = currentDate.getDate();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const hour = currentDate.getHours();
      const minutes = currentDate.getHours();
      const seconds = currentDate.getSeconds();
      const dateFormatted = `${day}-${month}-${year}-${hour}:${minutes}:${seconds}`;

      firestore
        .collection(collectionKey)
        .add({ device, temperature, humidity, dateFormatted})
          
        .then((res) => {
          console.log("Document " + device.name + " successfully written!");
        })
        .catch((error) => {
          console.error("Error writing document: ", error);
        });
        
    });
  });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log("Escuchando al puerto", PORT);
});