/**
 * ESQUEMA_AUTH.JS — MODELO DE USUARIOS AUTENTICADOS
 * ===================================================
 * Define la estructura de los documentos en la colección 'authusers' de MongoDB.
 *
 * CAMPOS:
 *   username  → Único, en minúsculas, sin espacios al inicio/final
 *   password  → hash bcrypt (NUNCA se guarda en texto plano)
 *   role      → 'user' (por defecto) o 'admin'
 *   creado    → fecha de registro automática
 *
 * MÉTODO comparePassword:
 *   Compara una contraseña en texto plano con el hash almacenado usando bcrypt.
 *   Retorna una promesa (boolean). Se usa en el controlador de login y en
 *   updateProfile para verificar la contraseña actual antes de cambiarla.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const authSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    creado: {
        type: Date,
        default: Date.now
    }
});

// Compara una contraseña en texto plano con el hash almacenado
authSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const AuthUser = mongoose.model('AuthUser', authSchema);

module.exports = AuthUser;
