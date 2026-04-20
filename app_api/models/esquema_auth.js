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
