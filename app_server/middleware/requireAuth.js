/**
 * REQUIREAUTH.JS — MIDDLEWARE DE PROTECCIÓN DE RUTAS
 * ====================================================
 * Este middleware se aplica a todas las rutas que requieren que el usuario
 * haya iniciado sesión. Si no hay sesión activa, redirige al /login.
 *
 * FUNCIONAMIENTO:
 *   1. Verifica que exista req.session.user (creado en doLogin / guestAccess)
 *   2. Si existe → expone el usuario a las vistas Pug via res.locals.sessionUser
 *                  y llama a next() para continuar con el router
 *   3. Si NO existe → guarda la URL destino en req.session.returnTo
 *                     y redirige al formulario de login
 *
 * res.locals.sessionUser:
 *   Hace que la variable 'sessionUser' esté disponible en TODAS las vistas Pug
 *   automáticamente. Se usa en layout.pug para mostrar el nombre del usuario,
 *   el menú admin, y el botón de logout.
 *
 * req.session.returnTo:
 *   Después del login exitoso, doLogin redirige a esta URL guardada,
 *   de modo que el usuario termina en la página que intentaba visitar.
 */

// Middleware que protege rutas: si no hay sesión activa, redirige al login
const requireAuth = (req, res, next) => {
    if (req.session && req.session.user) {
        // Exponer el usuario a todas las vistas de Pug
        res.locals.sessionUser = req.session.user;
        return next();
    }
    // Guardar destino para redirigir tras login
    req.session.returnTo = req.originalUrl;
    res.redirect('/login');
};

module.exports = requireAuth;
