const ewelink = require('ewelink-api');
const express = require('express');

const {createPDF} = require('./src/config/jspdf.js')
const {getDevices} = require('./src/config/ewelink-config.js');
const {sendEmail} = require('./src/config/nodemailer.js');

const app = express();

app.set('views', './public/views');
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/', async(req, res)=>{
    let devices = await getDevices();
    /* console.log(devices) */
    res.render('index', {devices: devices});
})

app.get('/email', (req, res)=>{
    sendEmail();
    res.send({"estado": 'Mensaje enviado'})
})

app.post('/enviar-reporte', async(req, res)=>{
    const {dispositivo, humedad, temperatura} = req.body;
    let pdfOutput = await createPDF(dispositivo, temperatura, humedad);
    sendEmail(pdfOutput);
    //console.log(dispositivo, humedad, temperatura);
    res.send({"dispositivo": dispositivo, "Humedad": humedad, "Temperatura": temperatura })

})

const PORT = 3000;

app.listen(PORT, ()=>{
    console.log("Escuchando al puerto", PORT);
})
