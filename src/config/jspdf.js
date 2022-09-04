const {jsPDF} = require("jspdf");

const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'cm',
    format: 'a4'
})

const createPDF = async(device, temperature, humidity, dateFormatted)=>{
  pdf.text(`Dispositivo: ${device}`, 1.5, 3.5);
  pdf.text(`Hora: ${dateFormatted}`, 1.5, 3.5);
  pdf.text(`Temperatura: ${temperature}%`, 1.5, 5.5);
  pdf.text(`Humedad: ${humidity}°C`, 1.5, 7.5);

  const pdfOutput = pdf.output("datauristring");
  return pdfOutput;
}

module.exports = {createPDF};