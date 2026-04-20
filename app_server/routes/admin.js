const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/admin');

// Todas las rutas /admin requieren rol admin
router.use(ctrl.requireAdmin);

router.get('/products', ctrl.adminProductsGet);
router.post('/products', ctrl.adminProductsCreate);
router.post('/products/delete/:id', ctrl.adminProductsDelete);

router.get('/services', ctrl.adminServicesGet);
router.post('/services', ctrl.adminServicesCreate);
router.post('/services/delete/:id', ctrl.adminServicesDelete);

router.get('/asesorias', ctrl.adminAsesoriasGet);
router.post('/asesorias/delete/:id', ctrl.adminAsesoriasDelete);

router.get('/users', ctrl.adminUsersGet);
router.post('/users/delete/:id', ctrl.adminUsersDelete);

module.exports = router;
