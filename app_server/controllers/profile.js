/**
 * CONTROLLERS/PROFILE.JS — CONTROLADOR DE PERFIL DE USUARIO
 * ===========================================================
 * Gestiona la página /perfil donde el usuario puede cambiar
 * su nombre de usuario y/o contraseña.
 *
 * FLUJO DE ACTUALIZACIÓN:
 *   1. El formulario envía: username (nuevo), currentPassword, newPassword
 *   2. profileUpdate llama a PUT /api/auth/profile/:id via requestApi()
 *   3. La API verifica currentPassword con bcrypt antes de actualizar
 *   4. Si tiene éxito, se actualiza req.session.user.username para que
 *      el navbar refleje el nuevo nombre sin necesidad de re-login
 *
 * NOTA: Los usuarios invitados (role === 'guest') no tienen _id real,
 * por lo que la vista perfil.pug les muestra un mensaje en lugar del formulario.
 */

const { requestApi } = require('../lib/apiClient');

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
