/**
 * ESQUEMA DE CLIENTES - PROVEEDOR DE INTERNET (ISP)
 * Define la estructura de datos para los clientes en MongoDB
 */

const mongoose = require('mongoose'); // Librería para interactuar con MongoDB

// Definir el esquema de clientes con sus campos
const usersSchema = new mongoose.Schema({
    // ========== INFORMACIÓN PERSONAL DEL CLIENTE ==========
    nombre: {
        type: String,
        required: true // Campo obligatorio - Nombre del cliente
    },
    apellido: {
        type: String,
        required: true // Campo obligatorio - Apellido del cliente
    },
    identificacion: {
        type: Number,
        required: true // Campo obligatorio - Cédula o identidad única del cliente
    },
    direccion: {
        type: String,
        required: false // Campo opcional - Dirección de instalación del servicio
    },
    telefono: {
        type: Number,
        default: 9999999999 // Valor por defecto si no se proporciona
    },
    email: {
        type: String,
        required: false // Campo opcional - Email de contacto del cliente
    },
    
    // ========== SERVICIOS CONTRATADOS POR EL CLIENTE ==========
    services: {
        internetPlans: [String],          // Array: planes de internet (ej: "100 Mbps", "1 Gbps")
        phonePlans: [String],             // Array: servicios telefónicos (ej: "Telefonía nacional")
        mobilePlans: [String],            // Array: planes celulares (ej: "Plan celular Premium")
        internationalChannels: [String]   // Array: canales de TV (ej: "CNN", "BBC", "ESPN")
    },
    
    // ========== METADATA ==========
    creado: {
        type: Date,
        default: Date.now // Registra automáticamente la fecha/hora de creación del cliente
    }
});

// ========== COMPILAR EL ESQUEMA EN UN MODELO ==========
// Este modelo se utilizará en los controladores para todas las operaciones de base de datos
// (Create, Read, Update, Delete)
const Users = mongoose.model('user', usersSchema);

// ========== EJEMPLO: CREAR UN CLIENTE DE PRUEBA ==========
// Esta es una instancia de ejemplo de cómo se ve un cliente registrado
const user = new Users({
    nombre: 'Mateo',
    apellido: 'Crisanto',
    identificacion: 1111,  // ID único del cliente
    direccion: 'Quito',
    telefono: 987654321,
    email: 'mateo@ejemplo.com',
    services: {
        internetPlans: ['100 Mbps'],              // Cliente tiene contrato de 100 Mbps
        phonePlans: ['Telefonía local'],          // Incluye servicio de telefonía local
        mobilePlans: ['Plan celular Premium'],    // Plan móvil premium
        internationalChannels: ['CNN', 'BBC']     // Acceso a 2 canales internacionales
    }
});

// Para guardar este usuario en la base de datos, descomenta la siguiente línea:
//user.save();

