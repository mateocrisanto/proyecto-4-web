/**
 * Script para crear el usuario administrador inicial.
 * Ejecutar una sola vez: node seed_admin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const dbURI =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    'mongodb://127.0.0.1/isp';

mongoose.connect(dbURI, { family: 4, serverSelectionTimeoutMS: 5000 })
    .then(async () => {
        require('./app_api/models/esquema_auth');
        const AuthUser = mongoose.model('AuthUser');

        const existing = await AuthUser.findOne({ username: 'mateo' });
        if (existing) {
            console.log('El usuario admin "mateo" ya existe.');
            process.exit(0);
        }

        const hashed = await bcrypt.hash('admin', 12);
        await AuthUser.create({ username: 'mateo', password: hashed, role: 'admin' });
        console.log('✓ Usuario admin "mateo" creado exitosamente.');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Error al conectar a la base de datos:', err.message);
        process.exit(1);
    });
