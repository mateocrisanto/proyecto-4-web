const Service = require('../models/esquema_services');

// GET /api/services
const servicesList = async (req, res) => {
    try {
        const services = await Service.find({}).sort({ categoria: 1, nombre: 1 });
        res.status(200).json(services);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener servicios' });
    }
};

// POST /api/services
const servicesCreate = async (req, res) => {
    const { nombre, descripcion, categoria } = req.body;
    if (!nombre || !categoria) {
        return res.status(400).json({ message: 'nombre y categoria son requeridos' });
    }
    try {
        const service = await Service.create({ nombre, descripcion, categoria });
        res.status(201).json(service);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE /api/services/:id
const servicesDelete = async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if (!service) return res.status(404).json({ message: 'Servicio no encontrado' });
        res.status(200).json({ message: 'Servicio eliminado' });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar servicio' });
    }
};

module.exports = { servicesList, servicesCreate, servicesDelete };
