const { requestApi } = require('../lib/apiClient');
const bcrypt = require('bcryptjs');

// GET /perfil
const profileGet = async (req, res) => {
    res.render('perfil', {
        title: 'Mi Perfil',
        user: req.session.user,
        error: null,
        success: null
    });
};

// POST /perfil
const profileUpdate = async (req, res) => {
    const { username, currentPassword, newPassword } = req.body;
    const userId = req.session.user._id;

    try {
        const { ok, status, body } = await requestApi(`/api/auth/profile/${userId}`, {
            method: 'PUT',
            body: JSON.stringify({ username, currentPassword, newPassword })
        });

        if (ok) {
            // Actualizar sesión con el nuevo username
            req.session.user = { ...req.session.user, username: body.username };
            return req.session.save(() =>
                res.render('perfil', {
                    title: 'Mi Perfil',
                    user: req.session.user,
                    error: null,
                    success: 'Perfil actualizado exitosamente'
                })
            );
        }

        res.render('perfil', {
            title: 'Mi Perfil',
            user: req.session.user,
            error: body?.message || 'Error al actualizar el perfil',
            success: null
        });
    } catch (err) {
        res.render('perfil', {
            title: 'Mi Perfil',
            user: req.session.user,
            error: 'Error al conectar con el servidor',
            success: null
        });
    }
};

module.exports = { profileGet, profileUpdate };
