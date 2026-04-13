const express = require('express');
const router = express.Router();

const ctrlMain = require('../controllers/main');

/* GET home page. */
router.get('/', ctrlMain.homepageController);
router.get('/products', ctrlMain.productsController);
router.get('/speedtest', ctrlMain.speedtestController);
router.get('/cart', ctrlMain.cartController);
router.get('/servicios', ctrlMain.servicesController);
router.get('/contacto', ctrlMain.contactController);

module.exports = router;
