const express = require('express');
const controller = require('../controllers/dashboardController');

const router = express.Router();

router.get('/summary', controller.getSummary);
router.get('/top-categories', controller.getTopCategories);
router.get('/category-distribution', controller.getCategoryDistribution);
router.get('/reorder-alerts', controller.getReorderAlerts);

module.exports = router;
