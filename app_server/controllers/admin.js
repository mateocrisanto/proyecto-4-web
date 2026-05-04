/**
 * CONTROLLERS/ADMIN.JS — CONTROLADORES DEL PANEL DE ADMINISTRACIÓN
 * ==================================================================
 * Contiene toda la lógica del panel privado /admin/*:
 *   - requireAdmin: middleware de verificación de rol
 *   - CRUD de Productos (con subida de imagen via multer)
 *   - CRUD de Servicios
 *   - Gestión de Asesorías (ver + eliminar)
 *   - Gestión de Usuarios (ver + eliminar)
 *
 * PATRÓN: Igual que otros controladores del servidor, usa requestApi()
 * para hablar con la REST API. No importa modelos Mongoose directamente.
 *
 * SUBIDA DE IMÁGENES (multer):
 *   - Destino: public/images/product_<timestamp>.<ext>
 *   - La ruta guardada en DB es: /images/product_<timestamp>.<ext>
 *   - Esta ruta sirve directamente como atributo src de <img>
 *   - Tamaño máximo: 5 MB | Formatos: jpg, jpeg, png, webp, gif
 *   - Si no se sube archivo, se usa req.body.imagenUrl o un placeholder
 */

const { requestApi } = require('../lib/apiClient');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ── CONFIGURACIÓN DE MULTER (subida de imágenes) ──────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Guardar en public/images/ — carpeta servida estáticamente por Express
        const dest = path.join(__dirname, '../../public/images');
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        // Nombre único con timestamp para evitar colisiones
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `product_${Date.now()}${ext}`);
    }
});
const fileFilter = (req, file, cb) => {
    // Solo aceptar formatos de imagen comunes
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5 MB

// ── MIDDLEWARE: SOLO ADMIN ────────────────────────────────────────────────────
// Se aplica en router.use() en routes/admin.js, DESPUÉS de requireAuth.
// Si el usuario tiene sesión pero no es admin, recibe un 403.
const requireAdmin = (req, res, next) => {
    if (req.session?.user?.role === 'admin') return next();
    res.status(403).render('error', { message: 'Acceso restringido a administradores', error: { status: 403 } });
};

// ── CATEGORÍAS DE PRODUCTOS (lista prestablecida) ────────────────────────────
const PRODUCT_CATEGORIES = ['Redes', 'Accesorios', 'Kits', 'Equipos', 'Telefonía', 'Otros'];

// ── PRODUCTOS ────────────────────────────────────────────────────────────────
// Gestión del catálogo de productos visible en /products

// GET /admin/products
const adminProductsGet = async (req, res) => {
    try {
        const { ok, body } = await requestApi('/api/products', { method: 'GET' });
        res.render('admin_products', {
            title: 'Gestión de Productos',
            products: ok && Array.isArray(body) ? body : [],
            categories: PRODUCT_CATEGORIES,
            error: ok ? null : 'Error al cargar productos'
        });
    } catch (err) {
        res.render('admin_products', { title: 'Gestión de Productos', products: [], categories: PRODUCT_CATEGORIES, error: 'Error al conectar con la API' });
    }
};

// POST /admin/products  (con imagen)
const adminProductsCreate = [
    upload.single('imagen'),
    async (req, res) => {
        const imagenPath = req.file ? `/images/${req.file.filename}` : (req.body.imagenUrl || '/images/placeholder.png');
        const postData = {
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            precio: parseFloat(req.body.precio) || 0,
            imagen: imagenPath,
            categoria: req.body.categoria,
            stock: parseInt(req.body.stock) || 0
        };
        try {
            await requestApi('/api/products', { method: 'POST', body: JSON.stringify(postData) });
        } catch (e) { /* ignore, redirect anyway */ }
        res.redirect('/admin/products');
    }
];

// GET /admin/products/edit/:id
const adminProductsEditGet = async (req, res) => {
    try {
        const { ok, body } = await requestApi(`/api/products/${req.params.id}`, { method: 'GET' });
        if (!ok) return res.redirect('/admin/products');
        res.render('admin_products', {
            title: 'Gestión de Productos',
            products: await requestApi('/api/products', { method: 'GET' }).then(r => r.ok && Array.isArray(r.body) ? r.body : []),
            categories: PRODUCT_CATEGORIES,
            editProduct: body,
            error: null
        });
    } catch (err) {
        res.redirect('/admin/products');
    }
};

// POST /admin/products/edit/:id  (con imagen opcional)
const adminProductsEditPost = [
    upload.single('imagen'),
    async (req, res) => {
        const imagenPath = req.file ? `/images/${req.file.filename}` : (req.body.imagenUrl || undefined);
        const putData = {
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            precio: parseFloat(req.body.precio) || 0,
            categoria: req.body.categoria,
            stock: parseInt(req.body.stock) || 0
        };
        if (imagenPath) putData.imagen = imagenPath;
        try {
            await requestApi(`/api/products/${req.params.id}`, { method: 'PUT', body: JSON.stringify(putData) });
        } catch (e) { /* ignore */ }
        res.redirect('/admin/products');
    }
];

// POST /admin/products/delete/:id
const adminProductsDelete = async (req, res) => {
    try {
        await requestApi(`/api/products/${req.params.id}`, { method: 'DELETE' });
    } catch (e) { /* ignore */ }
    res.redirect('/admin/products');
};

// ── SERVICIOS ────────────────────────────────────────────────────────────────
// Gestión de planes (internet, telefonía, celular, canales) visibles en /servicios

// GET /admin/services
const adminServicesGet = async (req, res) => {
    try {
        const { ok, body } = await requestApi('/api/services', { method: 'GET' });
        res.render('admin_services', {
            title: 'Gestión de Servicios',
            services: ok && Array.isArray(body) ? body : [],
            error: ok ? null : 'Error al cargar servicios'
        });
    } catch (err) {
        res.render('admin_services', { title: 'Gestión de Servicios', services: [], error: 'Error al conectar con la API' });
    }
};

// POST /admin/services
const adminServicesCreate = async (req, res) => {
    try {
        await requestApi('/api/services', {
            method: 'POST',
            body: JSON.stringify({ nombre: req.body.nombre, descripcion: req.body.descripcion, categoria: req.body.categoria })
        });
    } catch (e) { /* ignore */ }
    res.redirect('/admin/services');
};

// POST /admin/services/edit/:id
const adminServicesEditPost = async (req, res) => {
    try {
        await requestApi(`/api/services/${req.params.id}`, {
            method: 'PUT',
            body: JSON.stringify({ nombre: req.body.nombre, descripcion: req.body.descripcion, categoria: req.body.categoria })
        });
    } catch (e) { /* ignore */ }
    res.redirect('/admin/services');
};

// POST /admin/services/delete/:id
const adminServicesDelete = async (req, res) => {
    try {
        await requestApi(`/api/services/${req.params.id}`, { method: 'DELETE' });
    } catch (e) { /* ignore */ }
    res.redirect('/admin/services');
};

// ── ASESORÍAS ────────────────────────────────────────────────────────────────

// GET /admin/asesorias
const adminAsesoriasGet = async (req, res) => {
    try {
        const { ok, body } = await requestApi('/api/asesorias', { method: 'GET' });
        res.render('admin_asesorias', {
            title: 'Solicitudes de Asesoría',
            asesorias: ok && Array.isArray(body) ? body : [],
            error: ok ? null : 'Error al cargar asesorías'
        });
    } catch (err) {
        res.render('admin_asesorias', { title: 'Solicitudes de Asesoría', asesorias: [], error: 'Error al conectar con la API' });
    }
};

// POST /admin/asesorias/delete/:id
const adminAsesoriasDelete = async (req, res) => {
    try {
        await requestApi(`/api/asesorias/${req.params.id}`, { method: 'DELETE' });
    } catch (e) { /* ignore */ }
    res.redirect('/admin/asesorias');
};

// POST /admin/asesorias/:id/mensaje — admin envía mensaje al chat
const adminAsesoriasMensaje = async (req, res) => {
    try {
        await requestApi(`/api/asesorias/${req.params.id}/mensajes`, {
            method: 'POST',
            body: JSON.stringify({ autor: 'admin', texto: req.body.texto })
        });
    } catch (e) { /* ignore */ }
    res.redirect('/admin/asesorias');
};

// ── USUARIOS ─────────────────────────────────────────────────────────────────
// Lista todos los usuarios registrados. Los admins no pueden eliminarse a sí mismos
// (protección implementada en la vista admin_users.pug)

// GET /admin/users
const adminUsersGet = async (req, res) => {
    try {
        const { ok, body } = await requestApi('/api/auth/users', { method: 'GET' });
        res.render('admin_users', {
            title: 'Gestión de Usuarios',
            users: ok && Array.isArray(body) ? body : [],
            error: ok ? null : 'Error al cargar usuarios'
        });
    } catch (err) {
        res.render('admin_users', { title: 'Gestión de Usuarios', users: [], error: 'Error al conectar con la API' });
    }
};

// POST /admin/users/delete/:id
const adminUsersDelete = async (req, res) => {
    try {
        await requestApi(`/api/auth/users/${req.params.id}`, { method: 'DELETE' });
    } catch (e) { /* ignore */ }
    res.redirect('/admin/users');
};

module.exports = {
    requireAdmin,
    adminProductsGet,
    adminProductsCreate,
    adminProductsEditGet,
    adminProductsEditPost,
    adminProductsDelete,
    adminServicesGet,
    adminServicesCreate,
    adminServicesEditPost,
    adminServicesDelete,
    adminAsesoriasGet,
    adminAsesoriasDelete,
    adminAsesoriasMensaje,
    adminUsersGet,
    adminUsersDelete
};
