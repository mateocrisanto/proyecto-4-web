/**
 * ESQUEMA DE ASESORÍAS - PROVEEDOR DE INTERNET (ISP)
 * Define la estructura de datos para las solicitudes de asesorías en MongoDB
 */

const mongoose = require('mongoose'); // Librería para interactuar con MongoDB

// Definir el esquema de asesorías
const aseoriasSchema = new mongoose.Schema({
    // ========== INFORMACIÓN DEL CLIENTE ==========
    nombre: {
        type: String,
        required: true // Campo obligatorio - Nombre del cliente
    },
    
    // ========== DETALLE DE LA ASESORÍA ==========
    consulta: {
        type: String,
        required: true // Campo obligatorio - Consulta o tema de asesoría
    },
    
    // ========== METADATA ==========
    creado: {
        type: Date,
        default: Date.now // Registra automáticamente la fecha/hora de creación
    }
});

// ========== COMPILAR EL ESQUEMA EN UN MODELO ==========
// Este modelo se utilizará en los controladores para todas las operaciones de base de datos
const Asesorias = mongoose.model('asesoria', aseoriasSchema);

module.exports = Asesorias;
