/**
 * CONTROLADORES API - CHATBOT
 * Proporciona endpoints para FAQs predefinidas y mensajes del usuario
 */

const mongoose = require('mongoose');
const Chatbot = mongoose.model('Chatbot');
const ChatbotMessage = mongoose.model('ChatbotMessage');

// GET /api/chatbot/faqs - obtener todas las FAQs activas
const getFAQs = async (req, res) => {
  try {
    const faqs = await Chatbot.find({ activo: true }).sort({ categoria: 1 });
    res.status(200).json(faqs);
  } catch (err) {
    console.error('Error obteniendo FAQs:', err);
    res.status(500).json({ message: 'Error al obtener FAQs' });
  }
};

// POST /api/chatbot/ask - usuario hace una pregunta
const askChatbot = async (req, res) => {
  try {
    const { pregunta, userId } = req.body;
    
    if (!pregunta || !pregunta.trim()) {
      return res.status(400).json({ message: 'La pregunta es requerida' });
    }
    
    const preguntaNorm = pregunta.toLowerCase().trim();
    
    // Buscar FAQs que coincidan con palabras clave
    const faqs = await Chatbot.find({ activo: true });
    let respuesta = null;
    let matched = false;
    let categoriaMatch = 'general';
    
    // Lógica simple: buscar coincidencia de palabras clave
    for (const faq of faqs) {
      const hasMatch = faq.keywords.some(keyword => preguntaNorm.includes(keyword));
      if (hasMatch) {
        respuesta = faq.respuesta;
        matched = true;
        categoriaMatch = faq.categoria;
        break;
      }
    }
    
    // Si no hay coincidencia, respuesta por defecto
    if (!respuesta) {
      respuesta = 'Gracias por tu pregunta. Un agente se pondrá en contacto pronto para ayudarte.';
    }
    
    // Guardar la pregunta del usuario en historial
    const mensaje = new ChatbotMessage({
      userId: userId || null,
      pregunta: pregunta,
      respuesta: respuesta,
      matched: matched,
      categoria: categoriaMatch
    });
    
    await mensaje.save();
    
    res.status(200).json({
      respuesta: respuesta,
      matched: matched,
      categoria: categoriaMatch
    });
  } catch (err) {
    console.error('Error en chatbot:', err);
    res.status(500).json({ message: 'Error al procesar tu pregunta' });
  }
};

// POST /api/chatbot/admin/seed - llenar FAQs iniciales (solo admin)
const seedFAQs = async (req, res) => {
  try {
    // Verificar si ya existen FAQs
    const count = await Chatbot.countDocuments();
    if (count > 0) {
      return res.status(400).json({ message: 'Las FAQs ya existen en la base de datos' });
    }
    
    const faqs = [
      {
        keywords: ['envio', 'entrega', 'tiempo', 'demora'],
        pregunta: '¿Cuánto tiempo tarda la entrega?',
        respuesta: 'Los pedidos se entregan entre 3 a 5 días hábiles. Puedes seguir tu pedido en tu cuenta.',
        categoria: 'envios'
      },
      {
        keywords: ['pago', 'paypal', 'tarjeta', 'credito'],
        pregunta: '¿Qué métodos de pago aceptan?',
        respuesta: 'Aceptamos pagos con PayPal y tarjetas de crédito/débito. Tu información está segura.',
        categoria: 'pagos'
      },
      {
        keywords: ['devolucion', 'cambio', 'producto', 'defectuoso'],
        pregunta: '¿Puedo devolver un producto?',
        respuesta: 'Sí, puedes devolver productos dentro de 30 días. Contacta a nuestro equipo de soporte.',
        categoria: 'productos'
      },
      {
        keywords: ['cuenta', 'contraseña', 'usuario', 'login'],
        pregunta: '¿Cómo cambio mi contraseña?',
        respuesta: 'Ve a tu perfil y haz clic en "Cambiar contraseña". Asegúrate de usar una contraseña segura.',
        categoria: 'cuenta'
      },
      {
        keywords: ['soporte', 'ayuda', 'contacto', 'problema'],
        pregunta: '¿Cómo contacto con soporte?',
        respuesta: 'Puedes contactarnos mediante el formulario de contacto en nuestro sitio. Te responderemos pronto.',
        categoria: 'soporte'
      },
      {
        keywords: ['servicios', 'internet', 'planes', 'velocidad'],
        pregunta: '¿Qué servicios ofrecen?',
        respuesta: 'Ofrecemos planes de Internet de alta velocidad, telefonía, celular y más. Visita nuestros servicios.',
        categoria: 'general'
      }
    ];
    
    await Chatbot.insertMany(faqs);
    res.status(200).json({ message: 'FAQs iniciales cargadas exitosamente', count: faqs.length });
  } catch (err) {
    console.error('Error al llenar FAQs:', err);
    res.status(500).json({ message: 'Error al cargar FAQs iniciales' });
  }
};

module.exports = {
  getFAQs,
  askChatbot,
  seedFAQs
};
