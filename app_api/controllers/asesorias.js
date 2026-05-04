/**
 * CONTROLADORES DE LA API - ASESORÍAS
 */

const mongoose = require('mongoose');
const Asesoria = require('../models/esquema_asesorias');

// POST /api/asesorias
const asesoriaCreate = (req, res) => {
    Asesoria
        .create({
            nombre:   req.body.nombre,
            consulta: req.body.consulta,
            servicio: req.body.servicio || 'Otra consulta',
            userId:   req.body.userId || null,
            mensajes: []
        })
        .then(asesoria => res.status(201).json(asesoria))
        .catch(err   => res.status(400).json(err));
};

// GET /api/asesorias
const asesoriaList = (req, res) => {
    Asesoria
        .find({})
        .sort({ creado: -1 })
        .exec()
        .then(asesorias => res.status(200).json(asesorias))
        .catch(err       => res.status(404).json(err));
};

// GET /api/asesorias/user/:userId — la más reciente de este usuario
const asesoriaGetByUser = async (req, res) => {
    try {
        const a = await Asesoria.findOne({ userId: req.params.userId }).sort({ creado: -1 });
        if (!a) return res.status(404).json({ message: 'Sin asesorías para este usuario' });
        res.status(200).json(a);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/asesorias/:id
const asesoriaGetOne = async (req, res) => {
    try {
        const a = await Asesoria.findById(req.params.id);
        if (!a) return res.status(404).json({ message: 'Asesoría no encontrada' });
        res.status(200).json(a);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/asesorias/:id/mensajes  — agrega un mensaje al chat
const asesoriaAddMessage = async (req, res) => {
    const { autor, texto } = req.body;
    if (!autor || !texto) return res.status(400).json({ message: 'autor y texto son requeridos' });
    if (!['cliente', 'admin'].includes(autor)) return res.status(400).json({ message: 'autor debe ser cliente o admin' });
    try {
        const a = await Asesoria.findByIdAndUpdate(
            req.params.id,
            { $push: { mensajes: { autor, texto } } },
            { new: true, runValidators: true }
        );
        if (!a) return res.status(404).json({ message: 'Asesoría no encontrada' });
        res.status(200).json(a);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/asesorias/:id
const asesoriaDelete = async (req, res) => {
    try {
        const asesoria = await Asesoria.findByIdAndDelete(req.params.id);
        if (!asesoria) return res.status(404).json({ message: 'Asesoría no encontrada' });
        res.status(200).json({ message: 'Asesoría eliminada' });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar asesoría' });
    }
};

module.exports = { asesoriaCreate, asesoriaList, asesoriaGetByUser, asesoriaGetOne, asesoriaAddMessage, asesoriaDelete };
