const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const AuthUser = mongoose.model('AuthUser');

const SALT_ROUNDS = 12;

// POST /api/auth/register
// Crea un nuevo usuario con rol 'user' y contraseña hasheada
const register = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
    }

    try {
        const existing = await AuthUser.findOne({ username: username.toLowerCase().trim() });
        if (existing) {
            return res.status(409).json({ message: 'El usuario ya existe' });
        }

        const hashed = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await AuthUser.create({
            username: username.toLowerCase().trim(),
            password: hashed,
            role: 'user'
        });

        res.status(201).json({ _id: user._id, username: user.username, role: user.role });
    } catch (err) {
        console.error('Error al registrar usuario:', err);
        res.status(500).json({ message: 'Error interno al registrar usuario' });
    }
};

// POST /api/auth/login
// Verifica credenciales y retorna los datos del usuario (sin contraseña)
const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
    }

    try {
        const user = await AuthUser.findOne({ username: username.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        const match = await user.comparePassword(password);
        if (!match) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        res.status(200).json({ _id: user._id, username: user.username, role: user.role });
    } catch (err) {
        console.error('Error al iniciar sesión:', err);
        res.status(500).json({ message: 'Error interno al iniciar sesión' });
    }
};

module.exports = { register, login };

// PUT /api/auth/profile/:id
// Actualiza username y/o password del propio usuario
const updateProfile = async (req, res) => {
    const { username, currentPassword, newPassword } = req.body;
    try {
        const user = await AuthUser.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        if (username) {
            const taken = await AuthUser.findOne({ username: username.toLowerCase().trim(), _id: { $ne: user._id } });
            if (taken) return res.status(409).json({ message: 'Ese nombre de usuario ya está en uso' });
            user.username = username.toLowerCase().trim();
        }

        if (newPassword) {
            if (!currentPassword) return res.status(400).json({ message: 'Debes ingresar tu contraseña actual' });
            const match = await user.comparePassword(currentPassword);
            if (!match) return res.status(401).json({ message: 'Contraseña actual incorrecta' });
            user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
        }

        await user.save();
        res.status(200).json({ _id: user._id, username: user.username, role: user.role });
    } catch (err) {
        console.error('Error al actualizar perfil:', err);
        res.status(500).json({ message: 'Error interno al actualizar perfil' });
    }
};

// GET /api/auth/users  (admin only — filtrado en capa servidor)
const listUsers = async (req, res) => {
    try {
        const users = await AuthUser.find({}, '_id username role creado').sort({ creado: -1 });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
};

// DELETE /api/auth/users/:id  (admin only)
const deleteUser = async (req, res) => {
    try {
        const user = await AuthUser.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.status(200).json({ message: 'Usuario eliminado' });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar usuario' });
    }
};

Object.assign(module.exports, { updateProfile, listUsers, deleteUser });
