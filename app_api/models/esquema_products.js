/**
 * ESQUEMA DE PRODUCTOS - E-COMMERCE
 * Define la estructura de datos para los productos en MongoDB
 */

const mongoose = require('mongoose'); // Librería para interactuar con MongoDB

// Definir el esquema de productos con sus campos
const productsSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true // Nombre del producto
    },
    descripcion: {
        type: String,
        required: true // Descripción del producto
    },
    precio: {
        type: Number,
        required: true // Precio del producto
    },
    imagen: {
        type: String,
        required: true // URL o path de la imagen
    },
    categoria: {
        type: String,
        required: true // Categoría del producto
    },
    stock: {
        type: Number,
        default: 0 // Cantidad en stock
    },
    creado: {
        type: Date,
        default: Date.now // Fecha de creación
    }
});

// Crear el modelo
const Product = mongoose.model('Product', productsSchema);

module.exports = Product;