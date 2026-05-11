/**
 * ESQUEMA DE MENSAJES DEL CHATBOT - CONVERSACIONES DEL USUARIO
 * Almacena lo que el usuario pregunta en el chatbot (para análisis)
 */

const mongoose = require('mongoose');

const chatbotMessagesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Puede ser null si es anónimo
  },
  pregunta: {
    type: String,
    required: true
  },
  respuesta: {
    type: String
  },
  matched: {
    type: Boolean,
    default: false // Si el chatbot encontró una respuesta predefinida
  },
  categoria: {
    type: String,
    default: 'general'
  },
  creado: {
    type: Date,
    default: Date.now
  }
});

const ChatbotMessage = mongoose.model('ChatbotMessage', chatbotMessagesSchema);

module.exports = ChatbotMessage;
