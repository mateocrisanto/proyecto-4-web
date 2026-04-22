/**
 * ROUTES/AUTH.JS — RUTAS DE AUTENTICACIÓN (sin protección)
 * ==========================================================
 * Estas rutas son públicas: no requieren sesión activa.
 * Se registran en app.js ANTES del middleware requireAuth.
 *
 *   GET  /login    → Muestra el formulario de inicio de sesión
 *   POST /login    → Procesa credenciales y crea la sesión
 *   GET  /register → Muestra el formulario de registro
 *   POST /register → Crea la cuenta en la base de datos
 *   GET  /logout   → Destruye la sesión y redirige a /login
 *   GET  /guest    → Crea sesión con rol 'guest' (acceso limitado sin cuenta)
 */

const express = require('express');
const router  = express.Router();
const ctrlAuth = require('../controllers/auth');

router.get('/login',     ctrlAuth.showLogin);
router.post('/login',    ctrlAuth.doLogin);
router.get('/register',  ctrlAuth.showRegister);
router.post('/register', ctrlAuth.doRegister);
router.get('/logout',    ctrlAuth.logout);
router.get('/guest',     ctrlAuth.guestAccess); // sesión temporal de invitado

module.exports = router;
