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
