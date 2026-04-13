const mongoose = require('mongoose');
require('./app_api/models/db'); // Conectar a la DB

const Product = mongoose.model('Product');

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
    process.exit(0);
  } catch (error) {
    console.error('Error al poblar productos:', error);
    process.exit(1);
  }
}

populateProducts();