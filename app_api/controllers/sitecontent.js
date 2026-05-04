const SiteContent = require('../models/esquema_sitecontent');

// GET /api/sitecontent — devuelve todas las secciones
const siteContentList = async (req, res) => {
    try {
        const docs = await SiteContent.find({});
        // Convierte array de documentos en un objeto { section: data, ... }
        const result = {};
        docs.forEach(doc => { result[doc.section] = doc.data; });
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener el contenido del sitio' });
    }
};

// GET /api/sitecontent/:section — devuelve una sección específica
const siteContentGetSection = async (req, res) => {
    try {
        const doc = await SiteContent.findOne({ section: req.params.section });
        if (!doc) return res.status(404).json({ message: 'Sección no encontrada' });
        res.status(200).json(doc.data);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener la sección' });
    }
};

// PUT /api/sitecontent/:section — crea o actualiza una sección
const siteContentUpsertSection = async (req, res) => {
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ message: 'El cuerpo de la petición debe ser un objeto JSON' });
    }
    try {
        const doc = await SiteContent.findOneAndUpdate(
            { section: req.params.section },
            { data: req.body },
            { upsert: true, new: true, runValidators: true }
        );
        res.status(200).json(doc.data);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = { siteContentList, siteContentGetSection, siteContentUpsertSection };
