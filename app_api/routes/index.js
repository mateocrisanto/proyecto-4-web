const express = require('express');
const router = express.Router();

const ctrlProducts = require('../controllers/products');
const ctrlCart = require('../controllers/cart');
const ctrlAsesorias = require('../controllers/asesorias');
const ctrlAuth = require('../controllers/auth');
const ctrlServices = require('../controllers/services');
const ctrlSiteContent = require('../controllers/sitecontent');
const ctrlSearch = require('../controllers/search');
const ctrlChatbot = require('../controllers/chatbot');
const ctrlStats = require('../controllers/stats');

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

// rutas para búsqueda y filtrado de productos (ANTES de :productid)
router.get('/products/search', ctrlSearch.searchProducts);
router.get('/products/categories', ctrlSearch.getCategories);

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

// rutas para chatbot
router.get('/chatbot/faqs', ctrlChatbot.getFAQs);
router.post('/chatbot/ask', ctrlChatbot.askChatbot);
router.post('/chatbot/admin/seed', ctrlChatbot.seedFAQs);

// rutas para estadísticas (admin)
router.get('/stats/dashboard', ctrlStats.getDashboardStats);
router.get('/stats/products', ctrlStats.getProductStats);

module.exports = router;