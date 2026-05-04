const express = require('express');
const router = express.Router();

const ctrlProducts = require('../controllers/products');
const ctrlCart = require('../controllers/cart');
const ctrlAsesorias = require('../controllers/asesorias');
const ctrlAuth = require('../controllers/auth');
const ctrlServices = require('../controllers/services');
const ctrlSiteContent = require('../controllers/sitecontent');

// rutas de autenticación
router.post('/auth/register', ctrlAuth.register);
router.post('/auth/login', ctrlAuth.login);
router.put('/auth/profile/:id', ctrlAuth.updateProfile);
router.get('/auth/users', ctrlAuth.listUsers);
router.delete('/auth/users/:id', ctrlAuth.deleteUser);

// definir las rutas para las acciones sobre la colección de products
router
    .route('/products')
    .post(ctrlProducts.productsCreate)
    .get(ctrlProducts.productsList);

router
    .route('/products/:productid')
    .get(ctrlProducts.productsReadOne)
    .put(ctrlProducts.productsUpdateOne)
    .delete(ctrlProducts.productsDeleteOne);

// rutas para el carrito
router.route('/cart/:sessionid').get(ctrlCart.cartRead);
router.route('/cart/add').post(ctrlCart.cartAddItem);
router.route('/cart/update').put(ctrlCart.cartUpdateItem);
router.route('/cart/remove').delete(ctrlCart.cartRemoveItem);
router.route('/cart/clear').post(ctrlCart.cartClear);

// rutas para asesorías
router
    .route('/asesorias')
    .post(ctrlAsesorias.asesoriaCreate)
    .get(ctrlAsesorias.asesoriaList);
router.get('/asesorias/user/:userId', ctrlAsesorias.asesoriaGetByUser);
router.get('/asesorias/:id', ctrlAsesorias.asesoriaGetOne);
router.post('/asesorias/:id/mensajes', ctrlAsesorias.asesoriaAddMessage);
router.delete('/asesorias/:id', ctrlAsesorias.asesoriaDelete);

// rutas para servicios
router
    .route('/services')
    .get(ctrlServices.servicesList)
    .post(ctrlServices.servicesCreate);
router.put('/services/:id', ctrlServices.servicesUpdate);
router.delete('/services/:id', ctrlServices.servicesDelete);

// rutas para contenido del sitio
router.get('/sitecontent', ctrlSiteContent.siteContentList);
router.get('/sitecontent/:section', ctrlSiteContent.siteContentGetSection);
router.put('/sitecontent/:section', ctrlSiteContent.siteContentUpsertSection);

module.exports = router;