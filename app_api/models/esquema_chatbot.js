/**
 * ESQUEMA DE CHATBOT - FAQ Y PREGUNTAS FRECUENTES
 * Define la estructura para preguntas/respuestas predefinidas del chatbot
 */

const mongoose = require('mongoose');

const chatbotSchema = new mongoose.Schema({
  keywords: {
    type: [String], // palabras clave para matching (ej: ["envio", "entrega", "demora"])
    required: true,
    lowercase: true
  },
  pregunta: {
    type: String,
    required: true // Pregunta de ejemplo que el usuario podría hacer
  },
  respuesta: {
    type: String,
    required: true // Respuesta automática del chatbot
  },
  categoria: {
    type: String,
    enum: ['envios', 'pagos', 'productos', 'cuenta', 'soporte', 'general'],
    default: 'general'
  },
  activo: {
    type: Boolean,
    default: true // Para desactivar sin borrar
  },
  creado: {
    type: Date,
    default: Date.now
  }
});

const Chatbot = mongoose.model('Chatbot', chatbotSchema);

module.exports = Chatbot;
