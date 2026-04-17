const express = require('express');
const controller = require('../controllers/reportController');

const router = express.Router();

router.get('/operational', controller.operationalPdf);
router.get('/managerial', controller.managerialPdf);

module.exports = router;
