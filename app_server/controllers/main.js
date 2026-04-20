/**
 * CONTROLADORES DEL SERVIDOR - PÁGINAS ISP
 * ==========================================
 * Estos controladores manejan las vistas (Pug) que los usuarios ven
 * Hacen peticiones a la API REST para obtener datos
 * 
 * Estructura:
 * - Cada controlador obtiene datos
 * - Los renderiza con la vista cor respondiente
 * - Los datos se muestran al cliente
 */

const crypto = require('crypto');
const { requestApi } = require('../lib/apiClient');
const siteContent = require('../config/siteContent');

const ensureCartSessionId = (req, res) => {
  let sessionId = req.cookies?.cartSessionId || req.query.sessionId;

  if (!sessionId) {
    sessionId = `session_${crypto.randomUUID()}`;
    res.cookie('cartSessionId', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7
    });
  }

  return sessionId;
};


// ========== FUNCIÓN AUXILIAR: RENDERIZAR LA PÁGINA DE INICIO ==========
// Esta función regresa la vista con los datos de la página principal
const homepageRender = (req, res, products = [], services = {}) => {
  res.render('index', {
    title: siteContent.home.title,
    subtitle: siteContent.home.subtitle,
    featuredProducts: products,
    mainInternetPlans: siteContent.home.mainInternetPlans,
    mainPhonePlans: siteContent.home.mainPhonePlans,
    mainMobilePlans: siteContent.home.mainMobilePlans,
    mainChannels: siteContent.home.mainChannels
  });
};

// ========== CONTROLADOR: PÁGINA DE INICIO ==========
// GET /
// Landing page con medidor de velocidad y productos/servicios destacados
const homepageController = async (req, res, next) => {
  try {
    const { ok, status, body } = await requestApi('/api/products', { method: 'GET' });

    if (ok && Array.isArray(body)) {
      const featuredProducts = body.slice(0, 3);
      homepageRender(req, res, featuredProducts, {});
      return;
    }

    console.log('Error al obtener los productos:', status);
    homepageRender(req, res, [], {});
  } catch (err) {
    console.log('Error al obtener los productos:', err);
    homepageRender(req, res, [], {});
  }
};

// ========== CONTROLADOR: PÁGINA DE SERVICIOS ==========
// GET /servicios
const servicesController = async (req, res, next) => {
  try {
    const { ok, body } = await requestApi('/api/services', { method: 'GET' });
    // Si hay servicios en DB úsalos; si no, cae al siteContent estático
    if (ok && Array.isArray(body) && body.length > 0) {
      const byCategory = (cat) => body.filter(s => s.categoria === cat).map(s => s.nombre);
      return res.render('services', {
        title: siteContent.services.title,
        internetPlans: byCategory('internet'),
        phonePlans: byCategory('telefonia'),
        mobilePlans: byCategory('celular'),
        channels: byCategory('canales')
      });
    }
  } catch (e) { /* fall through */ }
  res.render('services', {
    title: siteContent.services.title,
    internetPlans: siteContent.services.internetPlans,
    phonePlans: siteContent.services.phonePlans,
    mobilePlans: siteContent.services.mobilePlans,
    channels: siteContent.services.channels
  });
};

// ========== CONTROLADOR: PÁGINA DE INFORMACIÓN ==========
// GET /informacion
// Muestra información sobre la empresa: misión, visión, valores
const informationController = (req, res, next) => {
  res.render('information', siteContent.information);
};

// ========== CONTROLADOR: PÁGINA DE CONTACTO ==========
// GET /contacto
// Muestra información de contacto y un formulario para enviar mensajes
const contactController = (req, res, next) => {
  res.render('contact', siteContent.contact);
};

// ========== CONTROLADOR: PÁGINA DE PERFIL ==========
// GET /perfil
// Muestra los datos del perfil del cliente (después de loguearse)
const perfilController = (req, res, next) => {
  res.render('perfil', {
    title: siteContent.profile.title,
    message: siteContent.profile.message
  });
};

// ========== FUNCIÓN AUXILIAR: RENDERIZAR LISTA DE CLIENTES ==========
// Renderiza la vista de la lista de clientes
// ========== CONTROLADOR: PÁGINA DE PRODUCTOS ==========
// GET /products
// Muestra todos los productos disponibles
const productsController = async (req, res, next) => {
  try {
    const { ok, status, body } = await requestApi('/api/products', { method: 'GET' });

    const normalizeProducts = (products) => {
      if (!Array.isArray(products)) {
        return [];
      }

      return products.map(product => ({
        ...product,
        nombre: product?.nombre || siteContent.products.fallbackName,
        descripcion: product?.descripcion || siteContent.products.fallbackDescription,
        precio: Number(product?.precio) || 0,
        imagen: product?.imagen || siteContent.products.placeholderImage,
        stock: Number(product?.stock) || 0
      }));
    };

    if (ok) {
      res.render('products', {
        title: siteContent.products.title,
        products: normalizeProducts(body)
      });
    } else {
      console.log('Error al obtener los productos:', status);
      res.render('products', { title: siteContent.products.title, products: [] });
    }
  } catch (err) {
    console.log('Error al obtener los productos:', err);
    res.render('products', { title: siteContent.products.title, products: [] });
  }
};

// ========== CONTROLADOR: PÁGINA DEL CARRITO ==========
// GET /cart
// Muestra el carrito de compras
const cartController = async (req, res, next) => {
  const sessionId = ensureCartSessionId(req, res);

  try {
    const { ok, status, body } = await requestApi(`/api/cart/${sessionId}`, { method: 'GET' });

    if (ok) {
      res.render('cart', { title: siteContent.cart.title, cart: body, sessionId });
      return;
    }

    console.log('Error al obtener el carrito:', status);
    res.render('cart', { title: siteContent.cart.title, cart: { items: [], total: 0 }, sessionId });
  } catch (err) {
    console.log('Error al obtener el carrito:', err);
    res.render('cart', { title: siteContent.cart.title, cart: { items: [], total: 0 }, sessionId });
  }
};

// ========== CONTROLADOR: EJECUTAR SPEEDTEST CLI ==========
// REMOVIDO: reemplazado por LibreSpeed (frontend + /backend/* endpoints)

module.exports = {
  homepageController,       // GET / - Página de inicio
  productsController,       // GET /products - Página de productos
  cartController,           // GET /cart - Página del carrito
  servicesController,       // GET /servicios - Página de servicios
  contactController         // GET /contacto - Página de contacto/asesorías
};
