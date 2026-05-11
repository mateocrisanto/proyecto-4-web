/**
 * CONTROLADORES API - BÚSQUEDA Y FILTRADO DE PRODUCTOS
 * Proporciona endpoint para buscar y filtrar productos
 */

const mongoose = require('mongoose');
const Product = mongoose.model('Product');

// GET /api/products/search?q=cable&minPrice=10&maxPrice=50&categoria=cables&sort=price
const searchProducts = async (req, res) => {
  try {
    const { q, minPrice, maxPrice, categoria, sort } = req.query;
    
    // Construir filtro dinámico
    let filter = {};
    
    // Búsqueda por texto (nombre o descripción)
    if (q && q.trim()) {
      const searchTerm = q.trim();
      filter.$or = [
        { nombre: { $regex: searchTerm, $options: 'i' } },
        { descripcion: { $regex: searchTerm, $options: 'i' } }
      ];
    }
    
    // Filtro por rango de precio
    if (minPrice || maxPrice) {
      filter.precio = {};
      if (minPrice) filter.precio.$gte = Number(minPrice);
      if (maxPrice) filter.precio.$lte = Number(maxPrice);
    }
    
    // Filtro por categoría
    if (categoria && categoria.trim()) {
      filter.categoria = new RegExp(categoria.trim(), 'i');
    }
    
    // Filtro por disponibilidad (stock > 0)
    filter.stock = { $gt: 0 };
    
    // Ejecutar query
    let query = Product.find(filter);
    
    // Ordenamiento
    if (sort) {
      switch(sort) {
        case 'price-asc':
          query = query.sort({ precio: 1 });
          break;
        case 'price-desc':
          query = query.sort({ precio: -1 });
          break;
        case 'newest':
          query = query.sort({ creado: -1 });
          break;
        case 'name':
          query = query.sort({ nombre: 1 });
          break;
        default:
          query = query.sort({ creado: -1 });
      }
    }
    
    const products = await query.exec();
    res.status(200).json(products);
  } catch (err) {
    console.error('Error en búsqueda de productos:', err);
    res.status(500).json({ message: 'Error al buscar productos' });
  }
};

// GET /api/products/categories - obtener categorías únicas
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('categoria');
    res.status(200).json(categories);
  } catch (err) {
    console.error('Error obteniendo categorías:', err);
    res.status(500).json({ message: 'Error al obtener categorías' });
  }
};

module.exports = {
  searchProducts,
  getCategories
};
