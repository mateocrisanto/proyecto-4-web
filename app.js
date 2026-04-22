/**
 * APP.JS — PUNTO DE ENTRADA PRINCIPAL DE LA APLICACIÓN
 * ======================================================
 * Este archivo configura y ensambla toda la aplicación Express.
 * Es el "núcleo" que une todos los módulos: modelos, rutas, middlewares y vistas.
 *
 * FLUJO DE UNA PETICIÓN:
 *   Navegador → bin/www → app.js → router correspondiente → controlador → vista Pug / JSON
 *
 * ORDEN CRÍTICO DE MIDDLEWARES (de arriba hacia abajo):
 *   1. Parsers (JSON, URL, cookies)
 *   2. Archivos estáticos (public/)
 *   3. Sesión de usuario (express-session)
 *   4. /api  → REST API interna (sin protección — tiene su propia lógica de auth)
 *   5. /     → authRouter (login / register / logout / guest — sin requerir sesión)
 *   6. /admin → requireAuth + adminRouter (solo admins)
 *   7. /     → requireAuth + indexRouter  (cualquier usuario autenticado)
 */

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session'); // Manejo de sesiones HTTP con cookie

// ── MODELOS ──────────────────────────────────────────────────────────────────
// Cargar db.js registra todos los esquemas Mongoose y establece la conexión
// con MongoDB Atlas. Debe importarse ANTES que cualquier router que use modelos.
require('./app_api/models/db');

// ── ROUTERS ───────────────────────────────────────────────────────────────────
// Cada router agrupa las rutas de una sección de la app
const indexRouter = require('./app_server/routes/index');   // páginas principales (requiere sesión)
const authRouter  = require('./app_server/routes/auth');    // login / register / logout / guest
const adminRouter = require('./app_server/routes/admin');   // panel de administración
const requireAuth = require('./app_server/middleware/requireAuth'); // middleware de protección
const apiRouter   = require('./app_api/routes/index');      // REST API interna (/api/*)

const app = express();

// ── MOTOR DE VISTAS ───────────────────────────────────────────────────────────
// Pug es el motor de plantillas. Las vistas (.pug) viven en app_server/views/
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'pug');

// ── MIDDLEWARES GLOBALES ───────────────────────────────────────────────────────
app.use(logger('dev'));                              // Log de peticiones HTTP en consola
app.use(express.json());                             // Parsear body JSON (para la REST API)
app.use(express.urlencoded({ extended: false }));    // Parsear body de formularios HTML
app.use(cookieParser());                             // Parsear cookies (cartSessionId, etc.)
app.use(express.static(path.join(__dirname, 'public'))); // Servir CSS, JS, imágenes desde public/

// ── SESIÓN DE USUARIO ─────────────────────────────────────────────────────────
// express-session guarda en memoria (por defecto) un objeto req.session por usuario.
// req.session.user contiene: { _id, username, role } tras el login.
// La cookie de sesión dura 8 horas y es httpOnly (no accesible por JS del navegador).
app.use(session({
  secret: process.env.SESSION_SECRET || 'newtech-dev-secret-change-in-production',
  resave: false,            // no re-guardar si no hubo cambios
  saveUninitialized: false, // no crear sesión hasta que se escriba algo
  cookie: {
    httpOnly: true,         // protección XSS: la cookie no es accesible desde JS
    maxAge: 8 * 60 * 60 * 1000  // 8 horas en milisegundos
  }
}));

// ── RUTAS ─────────────────────────────────────────────────────────────────────
app.use('/api', apiRouter);                    // REST API — no requiere sesión de navegador
app.use('/', authRouter);                      // /login, /register, /logout, /guest
app.use('/admin', requireAuth, adminRouter);   // Panel admin — solo con sesión activa + rol admin
app.use('/', requireAuth, indexRouter);        // Páginas principales — solo con sesión activa

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
