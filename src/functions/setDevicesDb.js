const { connection } = require("../config/ewelink-config");

const firebase = require("firebase");
const collectionKey = "devices"; //Nombre de la colecciòn

const setDevicesDb = async()=>{
    await connection.getRegion();

    return JSON.parse(process.env.DEVICES).forEach(async (device) => {
      const { temperature, ...err } =
        await connection.getDeviceCurrentTemperature(device.id);
      console.log(temperature, err);
  
      const { humidity } = await connection.getDeviceCurrentHumidity(device.id);
  
      const currentDate = new Date();
      require("firebase/firestore"); // eslint-disable-line global-require
  
      const db = firebase.firestore();
      db.collection(collectionKey).add({
        device,
        temperature,
        humidity,
        currentDate,
      });
      console.log("Document " + device.name + " successfully written!");
    });
}

module.exports = {setDevicesDb}

