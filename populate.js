const mongoose = require('mongoose');
require('./app_api/models/db'); // Conectar a la DB

const Product = mongoose.model('Product');
const SiteContent = require('./app_api/models/esquema_sitecontent');
const Service = require('./app_api/models/esquema_services');

// Productos de ejemplo
const sampleProducts = [
  {
    nombre: 'Router WiFi 6',
    descripcion: 'Router de alta velocidad con WiFi 6 para conexiones ultrarrápidas',
    precio: 89.99,
    imagen: '/images/router.jpg',
    categoria: 'Redes',
    stock: 15
  },
  {
    nombre: 'Cable Ethernet Cat6',
    descripcion: 'Cable de red de 10 metros para conexiones estables',
    precio: 12.50,
    imagen: '/images/cable.jpg',
    categoria: 'Accesorios',
    stock: 50
  },
  {
    nombre: 'Adaptador USB-C a Ethernet',
    descripcion: 'Adaptador para conectar dispositivos USB-C a red Ethernet',
    precio: 25.99,
    imagen: '/images/adaptador.jpg',
    categoria: 'Accesorios',
    stock: 30
  },
  {
    nombre: 'Switch de Red 8 Puertos',
    descripcion: 'Switch Gigabit para expandir tu red local',
    precio: 45.00,
    imagen: '/images/switch.jpg',
    categoria: 'Redes',
    stock: 10
  },
  {
    nombre: 'Repetidor WiFi',
    descripcion: 'Amplifica la señal WiFi en toda tu casa',
    precio: 35.99,
    imagen: '/images/repetidor.jpg',
    categoria: 'Redes',
    stock: 20
  },
  {
    nombre: 'Kit de Instalación de Red',
    descripcion: 'Todo lo necesario para instalar red en casa',
    precio: 75.00,
    imagen: '/images/kit.jpg',
    categoria: 'Kits',
    stock: 8
  }
];

async function populateProducts() {
  try {
    // Limpiar productos existentes
    await Product.deleteMany({});

    // Insertar productos de ejemplo
    await Product.insertMany(sampleProducts);

    console.log('Productos de ejemplo insertados correctamente');
  } catch (error) {
    console.error('Error al poblar productos:', error);
    process.exit(1);
  }
}

// ========== CONTENIDO DEL SITIO ==========
const siteContentSections = [
  {
    section: 'home',
    data: {
      title: 'New Tech',
      subtitle: 'Internet de calidad con productos de calidad. Prueba tu velocidad de internet y mira los beneficios que te ofrecemos.',
      mainInternetPlans: ['50 Mbps', '100 Mbps', '200 Mbps', '500 Mbps'],
      mainPhonePlans: ['Telefonia local', 'Telefonia nacional'],
      mainMobilePlans: ['Plan celular Estandar', 'Plan celular Premium'],
      mainChannels: ['CNN', 'ESPN', 'Discovery']
    }
  },
  {
    section: 'services',
    data: {
      title: 'Nuestros Servicios',
      internetPlans: [
        '10 Mbps', '20 Mbps', '30 Mbps', '50 Mbps', '80 Mbps', '100 Mbps',
        '200 Mbps', '300 Mbps', '500 Mbps', '800 Mbps', '1 Gbps', '2 Gbps'
      ],
      phonePlans: [
        'Telefonia local', 'Telefonia nacional', 'Telefonia internacional',
        'SMS ilimitados', 'Roaming internacional'
      ],
      mobilePlans: [
        'Plan celular Basico', 'Plan celular Estandar', 'Plan celular Premium'
      ],
      channels: [
        'CNN', 'BBC', 'ESPN', 'Telemundo', 'Discovery', 'EuroNews', 'Fox Sports'
      ]
    }
  },
  {
    section: 'information',
    data: {
      title: 'Informacion',
      company: 'Proveedor de Internet',
      mission: 'Conectamos a tu hogar y a tu empresa con servicios rapidos y confiables.',
      vision: 'Ser la mejor opcion local en paquetes de internet, telefonia y entretenimiento.',
      values: ['Calidad', 'Atencion al cliente', 'Flexibilidad', 'Servicio confiable']
    }
  },
  {
    section: 'contact',
    data: {
      title: 'Contacto',
      phone: '+593 99 123 4567',
      email: 'hola@proveedorinternet.com',
      address: 'Av. Principal 123, Ciudad XYZ'
    }
  },
  {
    section: 'products',
    data: {
      title: 'Productos',
      fallbackName: 'Producto sin nombre',
      fallbackDescription: 'Sin descripcion disponible.',
      placeholderImage: '/images/placeholder.png'
    }
  },
  {
    section: 'cart',
    data: { title: 'Carrito de Compras' }
  },
  {
    section: 'profile',
    data: {
      title: 'Perfil',
      message: 'Tu perfil de cliente con toda la informacion de tus planes y servicios.'
    }
  },
  {
    section: 'users',
    data: {
      createTitle: 'Registro de Cliente',
      createMessage: 'Registra tu servicio de Internet, telefonia y canales internacionales',
      editTitle: 'Editar Cliente',
      editMessage: 'Modifica los datos del cliente',
      deleteTitle: 'Eliminacion de Clientes',
      deleteMessage: 'Eliminar cliente registrado',
      profileTitle: 'Perfil de Cliente',
      createSuccessMessage: 'Cliente registrado exitosamente. ID: {id}',
      registrationError: 'Error al registrar el cliente',
      updateError: 'Error al actualizar el cliente',
      notFound: 'Cliente no encontrado',
      searchError: 'Error al buscar el cliente',
      deleteError: 'Error al eliminar el cliente',
      deleteSuccess: 'Cliente eliminado exitosamente',
      profileError: 'Error al cargar el perfil'
    }
  }
];

async function populateSiteContent() {
  try {
    await SiteContent.deleteMany({});
    await SiteContent.insertMany(siteContentSections);
    console.log('Contenido del sitio insertado correctamente');
  } catch (error) {
    console.error('Error al poblar contenido del sitio:', error);
    process.exit(1);
  }
}

// ========== SERVICIOS ==========
const sampleServices = [
  // Internet
  { nombre: '10 Mbps',  descripcion: 'Plan básico de internet',        categoria: 'internet' },
  { nombre: '20 Mbps',  descripcion: 'Plan básico plus',               categoria: 'internet' },
  { nombre: '30 Mbps',  descripcion: 'Plan estándar',                  categoria: 'internet' },
  { nombre: '50 Mbps',  descripcion: 'Plan estándar plus',             categoria: 'internet' },
  { nombre: '80 Mbps',  descripcion: 'Plan avanzado',                  categoria: 'internet' },
  { nombre: '100 Mbps', descripcion: 'Plan avanzado plus',             categoria: 'internet' },
  { nombre: '200 Mbps', descripcion: 'Plan profesional',               categoria: 'internet' },
  { nombre: '300 Mbps', descripcion: 'Plan profesional plus',          categoria: 'internet' },
  { nombre: '500 Mbps', descripcion: 'Plan empresarial',               categoria: 'internet' },
  { nombre: '800 Mbps', descripcion: 'Plan empresarial plus',          categoria: 'internet' },
  { nombre: '1 Gbps',   descripcion: 'Plan premium',                   categoria: 'internet' },
  { nombre: '2 Gbps',   descripcion: 'Plan ultra',                     categoria: 'internet' },
  // Telefonía
  { nombre: 'Telefonía local',           descripcion: 'Llamadas locales ilimitadas',       categoria: 'telefonia' },
  { nombre: 'Telefonía nacional',        descripcion: 'Llamadas a nivel nacional',         categoria: 'telefonia' },
  { nombre: 'Telefonía internacional',   descripcion: 'Llamadas internacionales',          categoria: 'telefonia' },
  { nombre: 'SMS ilimitados',            descripcion: 'Mensajes de texto sin límite',      categoria: 'telefonia' },
  { nombre: 'Roaming internacional',     descripcion: 'Servicio en el extranjero',         categoria: 'telefonia' },
  // Celular
  { nombre: 'Plan celular Básico',    descripcion: 'Datos y llamadas básicas',        categoria: 'celular' },
  { nombre: 'Plan celular Estándar',  descripcion: 'Datos y llamadas estándar',       categoria: 'celular' },
  { nombre: 'Plan celular Premium',   descripcion: 'Datos ilimitados y llamadas',     categoria: 'celular' },
  // Canales
  { nombre: 'CNN',        descripcion: 'Noticias internacionales',  categoria: 'canales' },
  { nombre: 'BBC',        descripcion: 'Noticias y documentales',   categoria: 'canales' },
  { nombre: 'ESPN',       descripcion: 'Deportes en vivo',          categoria: 'canales' },
  { nombre: 'Telemundo',  descripcion: 'Entretenimiento en español', categoria: 'canales' },
  { nombre: 'Discovery',  descripcion: 'Documentales y ciencia',    categoria: 'canales' },
  { nombre: 'EuroNews',   descripcion: 'Noticias europeas',         categoria: 'canales' },
  { nombre: 'Fox Sports', descripcion: 'Deportes y más',            categoria: 'canales' }
];

async function populateServices() {
  try {
    await Service.deleteMany({});
    await Service.insertMany(sampleServices);
    console.log('Servicios insertados correctamente');
  } catch (error) {
    console.error('Error al poblar servicios:', error);
    process.exit(1);
  }
}

async function runAll() {
  await populateProducts();
  await populateSiteContent();
  await populateServices();
  process.exit(0);
}

runAll();