/**
 * ESQUEMA DE ASESORÍAS - PROVEEDOR DE INTERNET (ISP)
 * Define la estructura de datos para las solicitudes de asesorías en MongoDB
 */

const mongoose = require('mongoose');

const mensajeSchema = new mongoose.Schema({
    autor:    { type: String, enum: ['cliente', 'admin'], required: true },
    texto:    { type: String, required: true },
    enviado:  { type: Date, default: Date.now }
}, { _id: false });

const aseoriasSchema = new mongoose.Schema({
    nombre:   { type: String, required: true },
    consulta: { type: String, required: true },
    servicio: { type: String, default: 'Otra consulta' },
    mensajes: { type: [mensajeSchema], default: [] },
    userId:   { type: String, index: true },   // ID del usuario que envió la solicitud
    creado:   { type: Date, default: Date.now }
});

const Asesorias = mongoose.model('asesoria', aseoriasSchema);
module.exports = Asesorias;
