/**
 * ESQUEMA_SERVICES.JS — MODELO DE PLANES DE SERVICIOS
 * =====================================================
 * Define la estructura de los documentos en la colección 'services' de MongoDB.
 * Estos son los planes de internet, telefonía, celular y canales que se muestran
 * en la página /servicios y que el administrador gestiona desde /admin/services.
 *
 * CAMPOS:
 *   nombre      → Nombre del plan, ej: "Internet 100 Mbps"
 *   descripcion → Detalles del plan (precio, velocidad, etc.)
 *   categoria   → Tipo de servicio. Solo acepta valores del enum:
 *                  'internet' | 'telefonia' | 'celular' | 'canales'
 *   creado      → Fecha de creación automática
 *
 * NOTA: Si no hay servicios en la DB, el controlador main.servicesController
 * usa como fallback los datos estáticos de app_server/config/siteContent.js
 */

const mongoose = require('mongoose');
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
