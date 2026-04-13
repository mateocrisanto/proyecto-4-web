const express = require('express');
const router = express.Router();

const ctrlProducts = require('../controllers/products');
const ctrlCart = require('../controllers/cart');
const ctrlAsesorias = require('../controllers/asesorias');

// definir las rutas para las acciones sobre la colección de products
router
    .route('/products')
    .post(ctrlProducts.productsCreate) // crear un nuevo producto
    .get(ctrlProducts.productsList);   // obtener todos los productos

// definir las rutas para las acciones sobre un producto
router
    .route('/products/:productid')
    .get(ctrlProducts.productsReadOne)        // leer un producto específico
    .put(ctrlProducts.productsUpdateOne)      // actualizar un producto específico
    .delete(ctrlProducts.productsDeleteOne);  // eliminar un producto específico

// rutas para el carrito
router
    .route('/cart/:sessionid')
    .get(ctrlCart.cartRead); // obtener carrito por session id

router
    .route('/cart/add')
    .post(ctrlCart.cartAddItem); // agregar item al carrito

router
    .route('/cart/update')
    .put(ctrlCart.cartUpdateItem); // actualizar cantidad de item

router
    .route('/cart/remove')
    .delete(ctrlCart.cartRemoveItem); // eliminar item del carrito

router
    .route('/cart/clear')
    .post(ctrlCart.cartClear); // vaciar carrito

// rutas para asesorías
router
    .route('/asesorias')
    .post(ctrlAsesorias.asesoriaCreate) // crear una nueva asesoría
    .get(ctrlAsesorias.asesoriaList);   // obtener todas las asesorías

module.exports = router;