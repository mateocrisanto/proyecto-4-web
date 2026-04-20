const { requestApi } = require('../lib/apiClient');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar multer para subida de imágenes de productos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = path.join(__dirname, '../../public/images');
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `product_${Date.now()}${ext}`);
    }
});
const fileFilter = (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// ========== MIDDLEWARE: SOLO ADMIN ==========
const requireAdmin = (req, res, next) => {
    if (req.session?.user?.role === 'admin') return next();
    res.status(403).render('error', { message: 'Acceso restringido a administradores', error: { status: 403 } });
};

// ========== PRODUCTOS ==========

// GET /admin/products
const adminProductsGet = async (req, res) => {
    try {
        const { ok, body } = await requestApi('/api/products', { method: 'GET' });
        res.render('admin_products', {
            title: 'Gestión de Productos',
            products: ok && Array.isArray(body) ? body : [],
            error: ok ? null : 'Error al cargar productos'
        });
    } catch (err) {
        res.render('admin_products', { title: 'Gestión de Productos', products: [], error: 'Error al conectar con la API' });
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

// POST /admin/products/delete/:id
const adminProductsDelete = async (req, res) => {
    try {
        await requestApi(`/api/products/${req.params.id}`, { method: 'DELETE' });
    } catch (e) { /* ignore */ }
    res.redirect('/admin/products');
};

// ========== SERVICIOS ==========

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

// POST /admin/services/delete/:id
const adminServicesDelete = async (req, res) => {
    try {
        await requestApi(`/api/services/${req.params.id}`, { method: 'DELETE' });
    } catch (e) { /* ignore */ }
    res.redirect('/admin/services');
};

// ========== ASESORÍAS ==========

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

// ========== USUARIOS ==========

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
    adminProductsDelete,
    adminServicesGet,
    adminServicesCreate,
    adminServicesDelete,
    adminAsesoriasGet,
    adminAsesoriasDelete,
    adminUsersGet,
    adminUsersDelete
};
