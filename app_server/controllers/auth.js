/**
 * CONTROLLERS/AUTH.JS — CONTROLADORES DE AUTENTICACIÓN DEL SERVIDOR
 * ===================================================================
 * Maneja el ciclo completo de autenticación de usuarios:
 * mostrar formularios, procesar datos, crear/destruir sesiones.
 *
 * PATRÓN: No accede a MongoDB directamente. En su lugar llama a la
 * REST API interna (/api/auth/*) via requestApi(). Esto mantiene la
 * separación entre capa de presentación y capa de datos.
 *
 * SESIÓN: req.session.user almacena { _id, username, role } tras login.
 *   - role 'user'  → acceso normal al sitio
 *   - role 'admin' → acceso normal + panel /admin/*
 *   - role 'guest' → acceso temporal sin cuenta (sin _id real)
 */

const { requestApi } = require('../lib/apiClient');

// GET /login — muestra el formulario de login
const showLogin = (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('login', { title: 'Iniciar Sesión', error: null });
};

// POST /login — procesa las credenciales y crea la sesión
const doLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const { ok, status, body } = await requestApi('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        if (ok && status === 200 && body && body.username) {
            req.session.user = { _id: body._id, username: body.username, role: body.role };
            const returnTo = req.session.returnTo || '/';
            delete req.session.returnTo;
            return req.session.save(() => res.redirect(returnTo));
        }

        res.render('login', {
            title: 'Iniciar Sesión',
            error: body.message || 'Credenciales incorrectas'
        });
    } catch (err) {
        res.render('login', {
            title: 'Iniciar Sesión',
            error: 'Error al conectar con el servidor'
        });
    }
};

// GET /register — muestra el formulario de registro
const showRegister = (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('register', { title: 'Crear Cuenta', error: null, success: null });
};

// POST /register — crea la cuenta y redirige al login
const doRegister = async (req, res) => {
    const { username, password, confirmPassword } = req.body;

    if (!username || !password) {
        return res.render('register', {
            title: 'Crear Cuenta',
            error: 'Usuario y contraseña son requeridos',
            success: null
        });
    }

    if (password !== confirmPassword) {
        return res.render('register', {
            title: 'Crear Cuenta',
            error: 'Las contraseñas no coinciden',
            success: null
        });
    }

    try {
        const { ok, status, body } = await requestApi('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        if (ok && status === 201) {
            return res.render('register', {
                title: 'Crear Cuenta',
                error: null,
                success: 'Cuenta creada exitosamente. Ya puedes iniciar sesión.'
            });
        }

        res.render('register', {
            title: 'Crear Cuenta',
            error: body.message || 'Error al registrar la cuenta',
            success: null
        });
    } catch (err) {
        res.render('register', {
            title: 'Crear Cuenta',
            error: 'Error al conectar con el servidor',
            success: null
        });
    }
};

// GET /logout — destruye la sesión por completo y redirige al login
const logout = (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
};

// GET /guest — crea una sesión temporal de invitado sin necesidad de cuenta.
// El rol 'guest' da acceso al sitio pero no a funciones sensibles como el perfil.
const guestAccess = (req, res) => {
    req.session.user = { _id: null, username: 'Invitado', role: 'guest' };
    req.session.save(() => res.redirect('/'));
};

module.exports = { showLogin, doLogin, showRegister, doRegister, logout, guestAccess };
