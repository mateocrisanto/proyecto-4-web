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

// Módulo para hacer peticiones HTTP a nuestra API REST
const request = require('request');
const crypto = require('crypto');

// ========== CONFIGURACIÓN DE AMBIENTES ==========
// Usa una URL configurable y elimina la barra final para evitar //api/products
const defaultApiServer = process.env.NODE_ENV === 'production'
  ? `http://127.0.0.1:${process.env.PORT || 3000}`
  : 'http://localhost:3000';

const apiOptions = {
  server: (process.env.API_SERVER || defaultApiServer).replace(/\/+$/, '')
};

// ========== DATOS DISPONIBLES PARA LOS SERVICIOS ==========
// Arrays con todas las opciones de planes y servicios que ofrecemos
const availableInternetPlans = [
  '10 Mbps', '20 Mbps', '30 Mbps', '50 Mbps', '80 Mbps', '100 Mbps',
  '200 Mbps', '300 Mbps', '500 Mbps', '800 Mbps', '1 Gbps', '2 Gbps'
];
const availablePhonePlans = [
  'Telefonía local', 'Telefonía nacional', 'Telefonía internacional',
  'SMS ilimitados', 'Roaming internacional'
];
const availableMobilePlans = [
  'Plan celular Básico', 'Plan celular Estándar', 'Plan celular Premium'
];
const availableChannels = [
  'CNN', 'BBC', 'ESPN', 'Telemundo', 'Discovery', 'EuroNews', 'Fox Sports'
];

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
    title: 'New Tech',
    subtitle: 'Internet de calidad con productos de calidad. Prueba tu velocidad de internet y mira los beneficios que te ofrecemos.',
    featuredProducts: products,
    mainInternetPlans: ['50 Mbps', '100 Mbps', '200 Mbps', '500 Mbps'],
    mainPhonePlans: ['Telefonía local', 'Telefonía nacional'],
    mainMobilePlans: ['Plan celular Estándar', 'Plan celular Premium'],
    mainChannels: ['CNN', 'ESPN', 'Discovery']
  });
};

// ========== CONTROLADOR: PÁGINA DE INICIO ==========
// GET /
// Landing page con medidor de velocidad y productos/servicios destacados
const homepageController = (req, res, next) => {
  const path = '/api/products';
  const requestOptions = {
    url: apiOptions.server + path,
    method: 'GET',
    json: {}
  };

  request(requestOptions, (err, response, body) => {
    if (err) {
      console.log('Error al obtener los productos:', err);
      homepageRender(req, res, [], {});
    } else if (response.statusCode === 200) {
      // Obtener solo los primeros 3 productos para la homepage
      const featuredProducts = body.slice(0, 3);
      homepageRender(req, res, featuredProducts, {});
    } else {
      console.log('Error al obtener los productos:', response.statusCode);
      homepageRender(req, res, [], {});
    }
  });
};

// ========== CONTROLADOR: PÁGINA DE SERVICIOS ==========
// GET /servicios
// Muestra todos los servicios disponibles: planes de internet, telefonía, celular, canales
const servicesController = (req, res, next) => {
  res.render('services', {
    title: 'Nuestros Servicios',
    internetPlans: availableInternetPlans,  // Mostrar todos los planes de internet
    phonePlans: availablePhonePlans,        // Mostrar servicios telefónicos
    mobilePlans: availableMobilePlans,      // Mostrar planes celulares
    channels: availableChannels             // Mostrar canales internacionales
  });
};

// ========== CONTROLADOR: PÁGINA DE INFORMACIÓN ==========
// GET /informacion
// Muestra información sobre la empresa: misión, visión, valores
const informationController = (req, res, next) => {
  res.render('information', {
    title: 'Información',
    company: 'Proveedor de Internet',
    mission: 'Conectamos a tu hogar y a tu empresa con servicios rápidos y confiables.',
    vision: 'Ser la mejor opción local en paquetes de internet, telefonía y entretenimiento.',
    values: ['Calidad', 'Atención al cliente', 'Flexibilidad', 'Servicio confiable']
  });
};

// ========== CONTROLADOR: PÁGINA DE CONTACTO ==========
// GET /contacto
// Muestra información de contacto y un formulario para enviar mensajes
const contactController = (req, res, next) => {
  res.render('contact', {
    title: 'Contacto',
    phone: '+593 99 123 4567',
    email: 'hola@proveedorinternet.com',
    address: 'Av. Principal 123, Ciudad XYZ'
  });
};

// ========== CONTROLADOR: PÁGINA DE PERFIL ==========
// GET /perfil
// Muestra los datos del perfil del cliente (después de loguearse)
const perfilController = (req, res, next) => {
  res.render('perfil', {
    title: 'Perfil',
    message: 'Tu perfil de cliente con toda la información de tus planes y servicios.'
  });
};

// ========== FUNCIÓN AUXILIAR: RENDERIZAR LISTA DE CLIENTES ==========
// Renderiza la vista de la lista de clientes
// ========== CONTROLADOR: PÁGINA DE PRODUCTOS ==========
// GET /products
// Muestra todos los productos disponibles
const productsController = (req, res, next) => {
  const path = '/api/products';
  const requestOptions = {
    url: apiOptions.server + path,
    method: 'GET',
    json: {}
  };

  request(requestOptions, (err, response, body) => {
    const normalizeProducts = (products) => {
      if (!Array.isArray(products)) {
        return [];
      }

      return products.map(product => ({
        ...product,
        nombre: product?.nombre || 'Producto sin nombre',
        descripcion: product?.descripcion || 'Sin descripción disponible.',
        precio: Number(product?.precio) || 0,
        imagen: product?.imagen || '/images/placeholder.png',
        stock: Number(product?.stock) || 0
      }));
    };

    if (err) {
      console.log('Error al obtener los productos:', err);
      res.render('products', { title: 'Productos', products: [] });
    } else if (response.statusCode === 200) {
      res.render('products', {
        title: 'Productos',
        products: normalizeProducts(body)
      });
    } else {
      console.log('Error al obtener los productos:', response.statusCode);
      res.render('products', { title: 'Productos', products: [] });
    }
  });
};

// ========== CONTROLADOR: PÁGINA DEL CARRITO ==========
// GET /cart
// Muestra el carrito de compras
const cartController = (req, res, next) => {
  const sessionId = ensureCartSessionId(req, res);
  const path = `/api/cart/${sessionId}`;
  const requestOptions = {
    url: apiOptions.server + path,
    method: 'GET',
    json: {}
  };

  request(requestOptions, (err, response, body) => {
    if (err) {
      console.log('Error al obtener el carrito:', err);
      res.render('cart', { title: 'Carrito de Compras', cart: { items: [], total: 0 }, sessionId: sessionId });
    } else if (response.statusCode === 200) {
      res.render('cart', { title: 'Carrito de Compras', cart: body, sessionId: sessionId });
    } else {
      console.log('Error al obtener el carrito:', response.statusCode);
      res.render('cart', { title: 'Carrito de Compras', cart: { items: [], total: 0 }, sessionId: sessionId });
    }
  });
};

// ========== CONTROLADOR: EJECUTAR SPEEDTEST CLI ==========
// GET /speedtest
const speedtestController = (req, res, next) => {
  const { execFile } = require('child_process');
  const candidates = process.platform === 'win32' ? ['speedtest.exe', 'speedtest'] : ['speedtest'];
  const args = ['--format=json'];

  const tryCommand = (index) => {
    if (index >= candidates.length) {
      res.status(500).json({ message: 'speedtest CLI no está disponible en el servidor.' });
      return;
    }

    const command = candidates[index];
    execFile(command, args, { timeout: 120000 }, (error, stdout, stderr) => {
      if (error) {
        if (error.code === 'ENOENT') {
          return tryCommand(index + 1);
        }
        console.error('Error ejecutando speedtest CLI:', command, error, stderr);
        res.status(500).json({ message: 'Error al ejecutar speedtest en el servidor.' });
        return;
      }

      try {
        const result = JSON.parse(stdout);
        const download = result.download && result.download.bandwidth ? (result.download.bandwidth * 8 / 1e6).toFixed(1) : null;
        const upload = result.upload && result.upload.bandwidth ? (result.upload.bandwidth * 8 / 1e6).toFixed(1) : null;
        const ping = result.ping && result.ping.latency ? result.ping.latency.toFixed(0) : null;

        res.status(200).json({
          download: download || '0.0',
          upload: upload || '0.0',
          ping: ping || '0',
          raw: result
        });
      } catch (parseError) {
        console.error('Error parseando JSON del speedtest CLI:', parseError, stdout);
        res.status(500).json({ message: 'Respuesta inválida de speedtest CLI.' });
      }
    });
  };

  tryCommand(0);
};

module.exports = {
  homepageController,       // GET / - Página de inicio
  productsController,       // GET /products - Página de productos
  speedtestController,      // GET /speedtest - Ejecuta CLI de Ookla
  cartController,           // GET /cart - Página del carrito
  servicesController,       // GET /servicios - Página de servicios
  contactController         // GET /contacto - Página de contacto/asesorías
};
