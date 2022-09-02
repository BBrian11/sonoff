const {jsPDF} = require("jspdf");

const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'cm',
    format: 'a4'
})

const createPDF = async(dispositivo, temperatura, humedad)=>{
  pdf.text(`Dispositivo: ${dispositivo}`, 1.5, 3.5);
  pdf.text(`Temperatura: ${temperatura}%`, 1.5, 5.5);
  pdf.text(`Humedad: ${humedad}°C`, 1.5, 7.5);

  const pdfOutput = pdf.output("datauristring");
  return pdfOutput;
}

module.exports = {createPDF};