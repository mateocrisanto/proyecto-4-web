/**
 * CONTROLADORES DE LA API - ASESORÍAS
 * ====================================
 * Estos controladores manejan las operaciones CRUD para asesorías
 */

const mongoose = require('mongoose');
const Asesoria = require('../models/esquema_asesorias');

// ========== CREAR UNA NUEVA ASESORÍA ==========
const asesoriaCreate = (req, res) => {
    Asesoria
        .create({
            nombre: req.body.nombre,
            consulta: req.body.consulta
        })
        .then(asesoria => {
            res.status(201).json(asesoria);
        })
        .catch(err => {
            res.status(400).json(err);
        });
};

// ========== LISTAR TODAS LAS ASESORÍAS ==========
const asesoriaList = (req, res) => {
    Asesoria
        .find({})
        .exec()
        .then(asesorias => {
            res.status(200).json(asesorias);
        })
        .catch(err => {
            res.status(404).json(err);
        });
};

// ========== ELIMINAR UNA ASESORÍA ==========
const asesoriaDelete = async (req, res) => {
    try {
        const asesoria = await Asesoria.findByIdAndDelete(req.params.id);
        if (!asesoria) return res.status(404).json({ message: 'Asesoría no encontrada' });
        res.status(200).json({ message: 'Asesoría eliminada' });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar asesoría' });
    }
};

module.exports = {
    asesoriaCreate,
    asesoriaList,
    asesoriaDelete
};
