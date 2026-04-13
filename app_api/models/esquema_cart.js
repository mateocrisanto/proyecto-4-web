/**
 * ESQUEMA DE CARRITO - E-COMMERCE
 * Define la estructura de datos para el carrito de compras en MongoDB
 */

const mongoose = require('mongoose'); // Librería para interactuar con MongoDB

// Definir el esquema de carrito con sus campos
const cartSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true // ID de sesión para identificar el carrito
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        nombre: String,
        precio: Number,
        cantidad: {
            type: Number,
            default: 1
        },
        imagen: String
    }],
    total: {
        type: Number,
        default: 0
    },
    creado: {
        type: Date,
        default: Date.now
    },
    actualizado: {
        type: Date,
        default: Date.now
    }
});

// Crear el modelo
const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;