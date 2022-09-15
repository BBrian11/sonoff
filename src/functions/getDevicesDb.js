const firebase = require("firebase");
const collectionKey = "devices"; //Nombre de la colecciòn

const getDevicesDb = async()=>{
    let before1day = new Date().getTime() - 24 * 3600 * 1000;
    let documentosFirebase = await firebase
        .firestore()
        .collection(collectionKey)
        .orderBy("currentDate")
        .startAt(new Date(before1day))
        .get();
        
    return documentosFirebase;
}

const getDevicesDbSorted = async()=>{
    let arrayData = [];
    let arrayTemperaturas = [];

    let documentos = await getDevicesDb();

    documentos.docs.map((doc) => {
        arrayData.push(doc.data());
    });

    arrayData.map((doc) => {
        arrayTemperaturas.push(doc.temperature);
    });

    const devicesIds = arrayData
    .map(({ device }) => device.name.match(/\d+/g))
    .flat();
    const devicesSorted = devicesIds.sort((a, b) => a - b);

    const devices = [];

    devicesSorted.forEach((id) => {
        devices.push(...arrayData.filter(({ device }) => device.name.includes(id)));
    });

    return devices;
}

module.exports = {getDevicesDb, getDevicesDbSorted};