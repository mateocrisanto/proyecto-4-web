const siteContent = {
  users: {
    createTitle: 'Registro de Cliente',
    createMessage: 'Registra tu servicio de Internet, telefonia y canales internacionales',
    editTitle: 'Editar Cliente',
    editMessage: 'Modifica los datos del cliente',
    deleteTitle: 'Eliminacion de Clientes',
    deleteMessage: 'Eliminar cliente registrado',
    profileTitle: 'Perfil de Cliente',
    createSuccessMessage: (id) => `Cliente registrado exitosamente. ID: ${id}`,
    registrationError: 'Error al registrar el cliente',
    updateError: 'Error al actualizar el cliente',
    notFound: 'Cliente no encontrado',
    searchError: 'Error al buscar el cliente',
    deleteError: 'Error al eliminar el cliente',
    deleteSuccess: 'Cliente eliminado exitosamente',
    profileError: 'Error al cargar el perfil'
  },
  home: {
    title: 'New Tech',
    subtitle: 'Internet de calidad con productos de calidad. Prueba tu velocidad de internet y mira los beneficios que te ofrecemos.',
    mainInternetPlans: ['50 Mbps', '100 Mbps', '200 Mbps', '500 Mbps'],
    mainPhonePlans: ['Telefonia local', 'Telefonia nacional'],
    mainMobilePlans: ['Plan celular Estandar', 'Plan celular Premium'],
    mainChannels: ['CNN', 'ESPN', 'Discovery']
  },
  services: {
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
  },
  information: {
    title: 'Informacion',
    company: 'Proveedor de Internet',
    mission: 'Conectamos a tu hogar y a tu empresa con servicios rapidos y confiables.',
    vision: 'Ser la mejor opcion local en paquetes de internet, telefonia y entretenimiento.',
    values: ['Calidad', 'Atencion al cliente', 'Flexibilidad', 'Servicio confiable']
  },
  contact: {
    title: 'Contacto',
    phone: process.env.CONTACT_PHONE || '+593 99 123 4567',
    email: process.env.CONTACT_EMAIL || 'hola@proveedorinternet.com',
    address: process.env.CONTACT_ADDRESS || 'Av. Principal 123, Ciudad XYZ'
  },
  profile: {
    title: 'Perfil',
    message: 'Tu perfil de cliente con toda la informacion de tus planes y servicios.'
  },
  cart: {
    title: 'Carrito de Compras'
  },
  products: {
    title: 'Productos',
    fallbackName: 'Producto sin nombre',
    fallbackDescription: 'Sin descripcion disponible.',
    placeholderImage: '/images/placeholder.png'
  }
};

module.exports = siteContent;
