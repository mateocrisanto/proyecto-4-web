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

// GET /logout — destruye la sesión y redirige al login
const logout = (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
};

// GET /guest — acceso sin cuenta (sesión de invitado)
const guestAccess = (req, res) => {
    req.session.user = { _id: null, username: 'Invitado', role: 'guest' };
    req.session.save(() => res.redirect('/'));
};

module.exports = { showLogin, doLogin, showRegister, doRegister, logout, guestAccess };
