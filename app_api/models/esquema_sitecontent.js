/**
 * ESQUEMA_SITECONTENT.JS — MODELO DE CONTENIDO DEL SITIO
 * ========================================================
 * Almacena el contenido configurable del sitio web (antes en siteContent.js).
 * Cada documento representa una sección del sitio identificada por su 'section'.
 *
 * SECCIONES DISPONIBLES:
 *   home        → Título, subtítulo y listas de planes principales
 *   information → Empresa, misión, visión, valores
 *   contact     → Teléfono, email, dirección
 *   products    → Título y textos de fallback para productos
 *   cart        → Título del carrito
 *   profile     → Título y mensaje del perfil
 *   users       → Títulos y mensajes de formularios de usuario
 */

const mongoose = require('mongoose');

const siteContentSchema = new mongoose.Schema({
    section: { type: String, required: true, unique: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true }
});

const SiteContent = mongoose.model('SiteContent', siteContentSchema);
module.exports = SiteContent;
