const nodemailer = require("nodemailer");
/* const { createPDF } = require("./jspdf.js"); */
const dotenv = require('dotenv');
dotenv.config();

let emailClient = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth:{
        user: process.env.GMAIL_SMTP_EMAIL,
        pass: process.env.GMAIL_SMTP_PASS
    },
    tls : { rejectUnauthorized: false }
});

const sendEmail = async(pdfOutput)=>{
    try {
        //let pdfOutput = await createPDF();
        emailClient.sendMail({
            from: `"Test"<gonzaloahuerta@gmail.com>`,
            to: 'huertagonzalo@hotmail.com',
            subject: "Reporte",
            text: "Adjunto a este correo se encuentra el PDF del reporte requerido.",
            attachments: [{path: pdfOutput}]
        })
    } catch (error) {
        console.log(error)
    }
}

module.exports = {sendEmail};