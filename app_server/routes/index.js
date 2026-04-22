/**
 * ROUTES/INDEX.JS — RUTAS PRINCIPALES (requieren sesión)
 * ========================================================
 * Todas estas rutas pasan primero por requireAuth en app.js,
 * por lo que solo son accesibles si el usuario tiene sesión activa.
 *
 * PÁGINAS DEL SITIO:
 *   GET /          → Página de inicio (hero + speedtest + servicios + productos)
 *   GET /products  → Catálogo de productos (con carrito)
 *   GET /cart      → Carrito de compras
 *   GET /servicios → Planes de servicios (leídos desde DB)
 *   GET /contacto  → Formulario de asesorías
 *   GET|POST /perfil → Ver / actualizar perfil del usuario
 *
 * LIBRESPEED (medidor de velocidad):
 *   GET /speedtest_worker.js    → Sirve el Web Worker de LibreSpeed desde public/
 *   GET|POST /backend/garbage   → Datos aleatorios para test de descarga
 *   GET|POST /backend/empty     → Respuesta vacía para test de carga y ping
 *   GET /backend/getIP          → Devuelve la IP del cliente
 */

const express = require('express');
const path = require('path');
const router = express.Router();

const ctrlMain      = require('../controllers/main');
const ctrlSpeedtest = require('../controllers/speedtest_backend');
const ctrlProfile   = require('../controllers/profile');

/* Páginas principales */
router.get('/', ctrlMain.homepageController);
router.get('/products', ctrlMain.productsController);
router.get('/cart', ctrlMain.cartController);
router.get('/servicios', ctrlMain.servicesController);
router.get('/contacto', ctrlMain.contactController);

/* Perfil — GET: muestra el formulario | POST: procesa cambios */
router.get('/perfil', ctrlProfile.profileGet);
router.post('/perfil', ctrlProfile.profileUpdate);

/* LibreSpeed: el navegador solicita este JS al cargar la página del speedtest */
router.get('/speedtest_worker.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/javascripts/speedtest_worker.js'));
});

/* LibreSpeed: backends de medición — usados internamente por speedtest_worker.js */
router.get('/backend/garbage', ctrlSpeedtest.garbageController); // descarga
router.get('/backend/empty',   ctrlSpeedtest.emptyController);   // ping
router.post('/backend/empty',  ctrlSpeedtest.emptyController);   // carga
router.get('/backend/getIP',   ctrlSpeedtest.getIpController);   // IP del cliente

module.exports = router;
