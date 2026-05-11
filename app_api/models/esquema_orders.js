/**
 * ESQUEMA DE ÓRDENES - HISTORIAL DE COMPRAS
 * Almacena todas las órdenes completadas
 */

const mongoose = require('mongoose');

const ordersSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      productId: mongoose.Schema.Types.ObjectId,
      nombre: String,
      precio: Number,
      cantidad: Number
    }
  ],
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  paypalOrderId: {
    type: String // ID de la orden en PayPal
  },
  status: {
    type: String,
    enum: ['pendiente', 'completada', 'cancelada'],
    default: 'pendiente'
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

const Order = mongoose.model('Order', ordersSchema);

module.exports = Order;
