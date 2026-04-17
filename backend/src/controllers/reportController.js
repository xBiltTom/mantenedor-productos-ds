const reportService = require('../services/reportService');

exports.operationalPdf = async (req, res) => {
  try {
    const pdf = await reportService.generateOperationalReport(req.query.categoria);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte-operacional.pdf');
    res.setHeader('Content-Length', pdf.length);
    res.end(pdf);
  } catch (error) {
    res.status(500).json({ message: 'No fue posible generar el reporte operacional', error: error.message });
  }
};

exports.managerialPdf = async (_req, res) => {
  try {
    const pdf = await reportService.generateManagerialReport();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte-gerencial.pdf');
    res.setHeader('Content-Length', pdf.length);
    res.end(pdf);
  } catch (error) {
    res.status(500).json({ message: 'No fue posible generar el reporte gerencial', error: error.message });
  }
};
