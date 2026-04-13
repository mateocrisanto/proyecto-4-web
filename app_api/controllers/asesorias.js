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

module.exports = {
    asesoriaCreate,
    asesoriaList
};
