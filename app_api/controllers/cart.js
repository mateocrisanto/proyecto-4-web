/**
 * CONTROLADORES DE LA API - CARRITO
 * ==================================
 * Estos controladores manejan las operaciones del carrito de compras
 */

const mongoose = require('mongoose');
const Cart = mongoose.model('Cart');
const Product = mongoose.model('Product');

// ========== OBTENER CARRITO POR SESSION ID ==========
const cartRead = (req, res) => {
    const sessionId = req.params.sessionid || req.body.sessionId;
    if (!sessionId) {
        res.status(400).json({ "message": "Se requiere sessionId" });
        return;
    }
    Cart
        .findOne({ sessionId: sessionId })
        .exec()
        .then(cart => {
            if (!cart) {
                // Crear carrito vacío si no existe
                const newCart = new Cart({
                    sessionId: sessionId,
                    items: [],
                    total: 0
                });
                newCart.save()
                    .then(cart => {
                        res.status(200).json(cart);
                    })
                    .catch(err => {
                        res.status(500).json(err);
                    });
            } else {
                res.status(200).json(cart);
            }
        })
        .catch(err => {
            res.status(404).json(err);
        });
};

// ========== AGREGAR PRODUCTO AL CARRITO ==========
const cartAddItem = (req, res) => {
    const sessionId = req.body.sessionId;
    const productId = req.body.productId;
    const cantidad = req.body.cantidad || 1;

    if (!sessionId || !productId) {
        res.status(400).json({ "message": "Se requieren sessionId y productId" });
        return;
    }

    // Obtener producto
    Product.findById(productId)
        .exec()
        .then(product => {
            if (!product) {
                res.status(404).json({ "message": "Producto no encontrado" });
                return;
            }

            // Buscar o crear carrito
            Cart.findOne({ sessionId: sessionId })
                .exec()
                .then(cart => {
                    if (!cart) {
                        cart = new Cart({
                            sessionId: sessionId,
                            items: [],
                            total: 0
                        });
                    }

                    // Verificar si el producto ya está en el carrito
                    const existingItem = cart.items.find(item => item.productId.toString() === productId);

                    if (existingItem) {
                        existingItem.cantidad += cantidad;
                    } else {
                        cart.items.push({
                            productId: product._id,
                            nombre: product.nombre,
                            precio: product.precio,
                            cantidad: cantidad,
                            imagen: product.imagen
                        });
                    }

                    // Calcular total
                    cart.total = cart.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
                    cart.actualizado = Date.now();

                    cart.save()
                        .then(cart => {
                            res.status(200).json(cart);
                        })
                        .catch(err => {
                            res.status(500).json(err);
                        });
                })
                .catch(err => {
                    res.status(500).json(err);
                });
        })
        .catch(err => {
            res.status(404).json(err);
        });
};

// ========== ACTUALIZAR CANTIDAD DE UN ITEM ==========
const cartUpdateItem = (req, res) => {
    const sessionId = req.body.sessionId;
    const productId = req.body.productId;
    const cantidad = req.body.cantidad;

    if (!sessionId || !productId || cantidad === undefined) {
        res.status(400).json({ "message": "Se requieren sessionId, productId y cantidad" });
        return;
    }

    Cart.findOne({ sessionId: sessionId })
        .exec()
        .then(cart => {
            if (!cart) {
                res.status(404).json({ "message": "Carrito no encontrado" });
                return;
            }

            const item = cart.items.find(item => item.productId.toString() === productId);
            if (!item) {
                res.status(404).json({ "message": "Producto no encontrado en el carrito" });
                return;
            }

            if (cantidad <= 0) {
                // Eliminar item si cantidad es 0 o menos
                cart.items = cart.items.filter(item => item.productId.toString() !== productId);
            } else {
                item.cantidad = cantidad;
            }

            // Recalcular total
            cart.total = cart.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
            cart.actualizado = Date.now();

            cart.save()
                .then(cart => {
                    res.status(200).json(cart);
                })
                .catch(err => {
                    res.status(500).json(err);
                });
        })
        .catch(err => {
            res.status(500).json(err);
        });
};

// ========== ELIMINAR ITEM DEL CARRITO ==========
const cartRemoveItem = (req, res) => {
    const sessionId = req.body.sessionId;
    const productId = req.body.productId;

    if (!sessionId || !productId) {
        res.status(400).json({ "message": "Se requieren sessionId y productId" });
        return;
    }

    Cart.findOne({ sessionId: sessionId })
        .exec()
        .then(cart => {
            if (!cart) {
                res.status(404).json({ "message": "Carrito no encontrado" });
                return;
            }

            cart.items = cart.items.filter(item => item.productId.toString() !== productId);

            // Recalcular total
            cart.total = cart.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
            cart.actualizado = Date.now();

            cart.save()
                .then(cart => {
                    res.status(200).json(cart);
                })
                .catch(err => {
                    res.status(500).json(err);
                });
        })
        .catch(err => {
            res.status(500).json(err);
        });
};

// ========== VACIAR CARRITO ==========
const cartClear = (req, res) => {
    const sessionId = req.body.sessionId;

    if (!sessionId) {
        res.status(400).json({ "message": "Se requiere sessionId" });
        return;
    }

    Cart.findOneAndUpdate(
        { sessionId: sessionId },
        { items: [], total: 0, actualizado: Date.now() },
        { new: true }
    )
    .exec()
    .then(cart => {
        if (!cart) {
            res.status(404).json({ "message": "Carrito no encontrado" });
        } else {
            res.status(200).json(cart);
        }
    })
    .catch(err => {
        res.status(500).json(err);
    });
};

module.exports = {
    cartRead,
    cartAddItem,
    cartUpdateItem,
    cartRemoveItem,
    cartClear
};