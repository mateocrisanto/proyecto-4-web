const express = require('express');
const path = require('path');
const router = express.Router();

const ctrlMain = require('../controllers/main');
const ctrlSpeedtest = require('../controllers/speedtest_backend');
const ctrlProfile = require('../controllers/profile');

/* GET home page. */
router.get('/', ctrlMain.homepageController);
router.get('/products', ctrlMain.productsController);
router.get('/cart', ctrlMain.cartController);
router.get('/servicios', ctrlMain.servicesController);
router.get('/contacto', ctrlMain.contactController);

/* Perfil */
router.get('/perfil', ctrlProfile.profileGet);
router.post('/perfil', ctrlProfile.profileUpdate);

/* LibreSpeed: worker file (resuelto relativo a la página por el navegador) */
router.get('/speedtest_worker.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/javascripts/speedtest_worker.js'));
});

/* LibreSpeed: endpoints backend */
router.get('/backend/garbage', ctrlSpeedtest.garbageController);
router.get('/backend/empty', ctrlSpeedtest.emptyController);
router.post('/backend/empty', ctrlSpeedtest.emptyController);
router.get('/backend/getIP', ctrlSpeedtest.getIpController);

module.exports = router;
