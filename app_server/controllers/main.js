/**
 * CONTROLADORES DEL SERVIDOR - PÁGINAS ISP
 * ==========================================
 * Estos controladores manejan las vistas (Pug) que los usuarios ven
 * Hacen peticiones a la API REST para obtener datos
 *
 * Estructura:
 * - Cada controlador obtiene datos de la API (incluyendo el contenido del sitio)
 * - Los renderiza con la vista correspondiente
 * - Los datos se muestran al cliente
 */

const crypto = require('crypto');
const { requestApi } = require('../lib/apiClient');

// ========== FUNCIÓN AUXILIAR: OBTENER SECCIÓN DE CONTENIDO ==========
// Consulta la API y devuelve la sección solicitada, o {} si no existe/falla.
const getSiteSection = async (section) => {
  try {
    const { ok, body } = await requestApi(`/api/sitecontent/${section}`, { method: 'GET' });
    if (ok && body && typeof body === 'object') return body;
  } catch (_) { /* fall through */ }
  return {};
};

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

const getPaypalClientId = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;

  if (!clientId || clientId.startsWith('TU_PAYPAL_')) {
    return null;
  }

  return clientId;
};

// ========== CONTROLADOR: PÁGINA DE INICIO ==========
// GET /
// Landing page con medidor de velocidad y productos/servicios destacados
const homepageController = async (req, res, next) => {
  try {
    const [homeContent, productsRes] = await Promise.all([
      getSiteSection('home'),
      requestApi('/api/products', { method: 'GET' })
    ]);

    const featuredProducts = (productsRes.ok && Array.isArray(productsRes.body))
      ? productsRes.body.slice(0, 3)
      : [];

    res.render('index', {
      title: homeContent.title,
      subtitle: homeContent.subtitle,
      featuredProducts,
      mainInternetPlans: homeContent.mainInternetPlans,
      mainPhonePlans: homeContent.mainPhonePlans,
      mainMobilePlans: homeContent.mainMobilePlans,
      mainChannels: homeContent.mainChannels
    });
  } catch (err) {
    console.log('Error al cargar la página de inicio:', err);
    res.render('index', {
      title: null,
      subtitle: null,
      featuredProducts: [],
      mainInternetPlans: [],
      mainPhonePlans: [],
      mainMobilePlans: [],
      mainChannels: []
    });
  }
};

// ========== CONTROLADOR: PÁGINA DE SERVICIOS ==========
// GET /servicios
const servicesController = async (req, res, next) => {
  try {
    const [servicesContent, servicesRes] = await Promise.all([
      getSiteSection('services'),
      requestApi('/api/services', { method: 'GET' })
    ]);

    const byCategory = (cat) =>
      (servicesRes.ok && Array.isArray(servicesRes.body))
        ? servicesRes.body.filter(s => s.categoria === cat).map(s => s.nombre)
        : [];

    res.render('services', {
      title: servicesContent.title,
      internetPlans: byCategory('internet'),
      phonePlans: byCategory('telefonia'),
      mobilePlans: byCategory('celular'),
      channels: byCategory('canales')
    });
  } catch (err) {
    console.log('Error al cargar servicios:', err);
    res.render('services', {
      title: null,
      internetPlans: [],
      phonePlans: [],
      mobilePlans: [],
      channels: []
    });
  }
};

// ========== CONTROLADOR: PÁGINA DE INFORMACIÓN ==========
// GET /informacion
const informationController = async (req, res, next) => {
  const content = await getSiteSection('information');
  res.render('information', content);
};

// ========== CONTROLADOR: PÁGINA DE CONTACTO ==========
// GET /contacto
const contactController = async (req, res, next) => {
  const content = await getSiteSection('contact');
  const userId  = req.session.user._id;

  // Si el usuario NO quiere una consulta nueva, buscar la más reciente en la DB
  if (!req.session.newContactRequest) {
    try {
      const r = await requestApi(`/api/asesorias/user/${userId}`, { method: 'GET' });
      if (r.ok && r.body) {
        return res.render('contact', { ...content, servicios: [], miAsesoria: r.body });
      }
    } catch (e) { /* sin asesoría previa, mostrar formulario */ }
  }

  // Formulario: limpiar flag y cargar servicios
  delete req.session.newContactRequest;
  let servicios = [];
  try {
    const sr = await requestApi('/api/services', { method: 'GET' });
    if (sr.ok && Array.isArray(sr.body)) servicios = sr.body;
  } catch (e) { /* lista vacía */ }
  res.render('contact', { ...content, servicios, miAsesoria: null });
};

// POST /contacto — proxy asesoría al API
const contactSubmitController = async (req, res) => {
  try {
    const { ok, status, body } = await requestApi('/api/asesorias', {
      method: 'POST',
      body: JSON.stringify({
        nombre:   req.body.nombre,
        consulta: req.body.consulta,
        servicio: req.body.servicio || 'Otra consulta',
        userId:   req.session.user._id
      })
    });
    res.status(status).json(body);
  } catch (err) {
    res.status(500).json({ message: 'Error al enviar asesoría' });
  }
};

// POST /contacto/mensaje — usuario envía mensaje de seguimiento
const contactMensajeController = async (req, res) => {
  const userId = req.session.user._id;
  // Buscar la asesoría activa del usuario
  try {
    const r = await requestApi(`/api/asesorias/user/${userId}`, { method: 'GET' });
    if (r.ok && r.body && r.body._id) {
      await requestApi(`/api/asesorias/${r.body._id}/mensajes`, {
        method: 'POST',
        body: JSON.stringify({ autor: 'cliente', texto: req.body.texto })
      });
    }
  } catch (e) { /* ignorar, redirigir igual */ }
  res.redirect('/contacto');
};

// GET /contacto/nueva — el usuario quiere enviar una nueva consulta
const contactNuevaController = (req, res) => {
  req.session.newContactRequest = true;
  res.redirect('/contacto');
};

// ========== CONTROLADOR: PÁGINA DE PRODUCTOS ==========
// GET /products
const productsController = async (req, res, next) => {
  try {
    const [productsContent, productsRes] = await Promise.all([
      getSiteSection('products'),
      requestApi('/api/products', { method: 'GET' })
    ]);

    const normalizeProducts = (products) => {
      if (!Array.isArray(products)) return [];
      return products.map(product => ({
        ...product,
        nombre: product?.nombre || productsContent.fallbackName,
        descripcion: product?.descripcion || productsContent.fallbackDescription,
        precio: Number(product?.precio) || 0,
        imagen: product?.imagen || productsContent.placeholderImage,
        stock: Number(product?.stock) || 0
      }));
    };

    if (productsRes.ok) {
      res.render('products', {
        title: productsContent.title,
        products: normalizeProducts(productsRes.body)
      });
    } else {
      console.log('Error al obtener los productos:', productsRes.status);
      res.render('products', { title: productsContent.title, products: [] });
    }
  } catch (err) {
    console.log('Error al obtener los productos:', err);
    res.render('products', { title: null, products: [] });
  }
};

// ========== CONTROLADOR: PÁGINA DEL CARRITO ==========
// GET /cart
const cartController = async (req, res, next) => {
  const sessionId = ensureCartSessionId(req, res);
  const paypalClientId = getPaypalClientId();

  try {
    const [cartContent, cartRes] = await Promise.all([
      getSiteSection('cart'),
      requestApi(`/api/cart/${sessionId}`, { method: 'GET' })
    ]);

    if (cartRes.ok) {
      res.render('cart', { title: cartContent.title, cart: cartRes.body, sessionId, paypalClientId });
      return;
    }

    console.log('Error al obtener el carrito:', cartRes.status);
    res.render('cart', { title: cartContent.title, cart: { items: [], total: 0 }, sessionId, paypalClientId });
  } catch (err) {
    console.log('Error al obtener el carrito:', err);
    res.render('cart', { title: null, cart: { items: [], total: 0 }, sessionId, paypalClientId });
  }
};

// ========== CONTROLADORES PROXY: OPERACIONES DEL CARRITO ==========
// POST /cart/add
const cartAddController = async (req, res) => {
  const sessionId = ensureCartSessionId(req, res);
  try {
    const { status, body } = await requestApi('/api/cart/add', {
      method: 'POST',
      body: JSON.stringify({ ...req.body, sessionId })
    });
    res.status(status).json(body);
  } catch (err) {
    res.status(500).json({ message: 'Error al agregar al carrito' });
  }
};

// PUT /cart/update
const cartUpdateController = async (req, res) => {
  const sessionId = ensureCartSessionId(req, res);
  try {
    const { status, body } = await requestApi('/api/cart/update', {
      method: 'PUT',
      body: JSON.stringify({ ...req.body, sessionId })
    });
    res.status(status).json(body);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar carrito' });
  }
};

// DELETE /cart/remove
const cartRemoveController = async (req, res) => {
  const sessionId = ensureCartSessionId(req, res);
  try {
    const { status, body } = await requestApi('/api/cart/remove', {
      method: 'DELETE',
      body: JSON.stringify({ ...req.body, sessionId })
    });
    res.status(status).json(body);
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar producto del carrito' });
  }
};

// POST /cart/clear
const cartClearController = async (req, res) => {
  const sessionId = ensureCartSessionId(req, res);
  try {
    const { status, body } = await requestApi('/api/cart/clear', {
      method: 'POST',
      body: JSON.stringify({ ...req.body, sessionId })
    });
    res.status(status).json(body);
  } catch (err) {
    res.status(500).json({ message: 'Error al vaciar carrito' });
  }
};

module.exports = {
  homepageController,
  productsController,
  cartController,
  cartAddController,
  cartUpdateController,
  cartRemoveController,
  cartClearController,
  servicesController,
  informationController,
  contactController,
  contactSubmitController,
  contactMensajeController,
  contactNuevaController
};
