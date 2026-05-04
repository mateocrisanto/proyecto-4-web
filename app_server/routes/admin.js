/**
 * ROUTES/ADMIN.JS — RUTAS DEL PANEL ADMINISTRADOR
 * =================================================
 * Todas las rutas aquí bajo /admin pasan por DOS capas de protección:
 *   1. requireAuth  (en app.js) — verifica que exista req.session.user
 *   2. requireAdmin (en este router) — verifica que el rol sea 'admin'
 *
 * Si un usuario normal intenta acceder a /admin/*, recibe un error 403.
 *
 * SECCIONES DEL PANEL:
 *   /admin/products  → CRUD de productos del catálogo (con subida de imagen)
 *   /admin/services  → CRUD de planes de servicios (internet, telefonía, etc.)
 *   /admin/asesorias → Ver y eliminar solicitudes de contacto de los clientes
 *   /admin/users     → Ver todos los usuarios registrados y eliminarlos
 */

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/admin');

// Verificación de rol admin para TODAS las rutas de este router
router.use(ctrl.requireAdmin);

// ── Productos ─────────────────────────────────────────────────────────────────
router.get('/products',              ctrl.adminProductsGet);       // lista de productos
router.post('/products',             ctrl.adminProductsCreate);    // crear producto (con imagen)
router.get('/products/edit/:id',     ctrl.adminProductsEditGet);   // cargar producto para editar
router.post('/products/edit/:id',    ctrl.adminProductsEditPost);  // guardar cambios del producto
router.post('/products/delete/:id',  ctrl.adminProductsDelete);    // eliminar producto

// ── Servicios ─────────────────────────────────────────────────────────────────
router.get('/services',              ctrl.adminServicesGet);       // lista de planes
router.post('/services',             ctrl.adminServicesCreate);    // crear plan
router.post('/services/edit/:id',    ctrl.adminServicesEditPost);  // guardar cambios del plan
router.post('/services/delete/:id',  ctrl.adminServicesDelete);    // eliminar plan

// ── Asesorías (solicitudes de clientes) ───────────────────────────────────────
router.get('/asesorias',                  ctrl.adminAsesoriasGet);      // ver todas
router.post('/asesorias/delete/:id',      ctrl.adminAsesoriasDelete);   // eliminar
router.post('/asesorias/:id/mensaje',     ctrl.adminAsesoriasMensaje);  // enviar mensaje

// ── Usuarios ──────────────────────────────────────────────────────────────────
router.get('/users',                 ctrl.adminUsersGet);    // ver todos los usuarios
router.post('/users/delete/:id',     ctrl.adminUsersDelete); // eliminar usuario

module.exports = router;
