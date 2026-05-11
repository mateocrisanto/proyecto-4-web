/**
 * CONTROLADORES API - ESTADÍSTICAS PARA DASHBOARD ADMIN
 * Proporciona endpoints con datos agregados del sistema
 */

const mongoose = require('mongoose');
const AuthUser = mongoose.model('AuthUser');
const Product = mongoose.model('Product');
const Order = mongoose.model('Order');
const Asesoria = mongoose.model('asesoria');

// GET /api/stats/dashboard - obtener datos del dashboard
const getDashboardStats = async (req, res) => {
  try {
    // Datos en paralelo
    const [totalUsers, totalProducts, lowStockProducts, recentOrders, pendingAsesorias] = await Promise.all([
      AuthUser.countDocuments(),
      Product.countDocuments(),
      Product.find({ stock: { $gt: 0, $lt: 5 } }).select('nombre stock'),
      Order.find({ status: 'completada' }).sort({ creado: -1 }).limit(10),
      Asesoria.countDocuments({ estado: 'abierta' })
    ]);
    
    // Calcular ingresos totales
    const ordersAgg = await Order.aggregate([
      { $match: { status: 'completada' } },
      { $group: { _id: null, totalIngresos: { $sum: '$total' }, totalOrdenes: { $sum: 1 } } }
    ]);
    
    const totalIngresos = ordersAgg[0]?.totalIngresos || 0;
    const totalOrdenes = ordersAgg[0]?.totalOrdenes || 0;
    
    // Productos más vendidos
    const topProducts = await Order.aggregate([
      { $match: { status: 'completada' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.productId', cantidad: { $sum: '$items.cantidad' }, ingresos: { $sum: { $multiply: ['$items.precio', '$items.cantidad'] } } } },
      { $sort: { cantidad: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'producto' } }
    ]);
    
    // Órdenes por mes (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const ordenesPorMes = await Order.aggregate([
      { $match: { creado: { $gte: sixMonthsAgo }, status: 'completada' } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$creado' } },
        total: { $sum: '$total' },
        cantidad: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);
    
    res.status(200).json({
      resumen: {
        totalUsers,
        totalProducts,
        totalOrdenes,
        totalIngresos: totalIngresos.toFixed(2),
        asesoriasAbiertas: pendingAsesorias
      },
      alertas: {
        productosStockBajo: lowStockProducts
      },
      topProducts,
      ordenesPorMes,
      ultimasOrdenes: recentOrders
    });
  } catch (err) {
    console.error('Error obteniendo estadísticas:', err);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
};

// GET /api/stats/products - estadísticas de productos
const getProductStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const sinStock = await Product.countDocuments({ stock: 0 });
    const stockBajo = await Product.countDocuments({ stock: { $gt: 0, $lt: 5 } });
    const precioPromedio = (await Product.aggregate([{ $group: { _id: null, avg: { $avg: '$precio' } } }]))[0]?.avg || 0;
    
    res.status(200).json({
      totalProducts,
      sinStock,
      stockBajo,
      precioPromedio: precioPromedio.toFixed(2)
    });
  } catch (err) {
    console.error('Error obteniendo stats de productos:', err);
    res.status(500).json({ message: 'Error al obtener estadísticas de productos' });
  }
};

module.exports = {
  getDashboardStats,
  getProductStats
};
