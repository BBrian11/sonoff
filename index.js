var name = "Test sonoff";
console.log(name);
var inicio = Date.now();
console.log(inicio);
const ewelink = require('ewelink-api');
(async () => {
    const connection = new ewelink({
        email: 'betapharma123@gmail.com',
        password: 'Betapharma123',
        region: 'us'
    });

    /* get all devices */
    const devices = await connection.getDevices();
    console.log(devices);
    var fin = Date.now();
    console.log(fin);
console.log("delay ="+(fin-inicio)/1000 + "segundos");

    /* get specific devide info */
   const device = await connection.getDevice('1001498e4a');
   console.log(device);

    /* toggle device */
    //await connection.toggleDevice('<your device id>');

})();
