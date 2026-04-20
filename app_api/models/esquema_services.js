const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String, default: '' },
    categoria: {
        type: String,
        required: true,
        enum: ['internet', 'telefonia', 'celular', 'canales']
    },
    creado: { type: Date, default: Date.now }
});

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;
