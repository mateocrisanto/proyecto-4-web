/**
 * CONTROLADORES DE LA API - PRODUCTOS
 * ====================================
 * Estos controladores manejan las operaciones CRUD para productos
 */

const mongoose = require('mongoose');
const Product = mongoose.model('Product');

// ========== LISTAR TODOS LOS PRODUCTOS ==========
const productsList = (req, res) => {
    Product
        .find({})
        .exec()
        .then(products => {
            res.status(200).json(products);
        })
        .catch(err => {
            res.status(404).json(err);
        });
};

// ========== CREAR UN NUEVO PRODUCTO ==========
const productsCreate = (req, res) => {
    Product
        .create({
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            precio: req.body.precio,
            imagen: req.body.imagen,
            categoria: req.body.categoria,
            stock: req.body.stock
        })
        .then(product => {
            res.status(201).json(product);
        })
        .catch(err => {
            res.status(400).json(err);
        });
};

// ========== LEER UN PRODUCTO POR ID ==========
const productsReadOne = (req, res) => {
    if (req.params && req.params.productid) {
        Product
            .findById(req.params.productid)
            .exec()
            .then(product => {
                if (!product) {
                    res.status(404).json({ "message": "Producto no encontrado" });
                } else {
                    res.status(200).json(product);
                }
            })
            .catch(err => {
                res.status(404).json(err);
            });
    } else {
        res.status(404).json({ "message": "No se encontró productid en la solicitud" });
    }
};

// ========== ACTUALIZAR UN PRODUCTO ==========
const productsUpdateOne = (req, res) => {
    if (!req.params.productid) {
        res.status(404).json({ "message": "Se requiere productid" });
        return;
    }
    Product
        .findById(req.params.productid)
        .exec()
        .then(product => {
            if (!product) {
                res.status(404).json({ "message": "productid no encontrado" });
                return;
            }
            product.nombre = req.body.nombre;
            product.descripcion = req.body.descripcion;
            product.precio = req.body.precio;
            product.imagen = req.body.imagen;
            product.categoria = req.body.categoria;
            product.stock = req.body.stock;
            product.save()
                .then(product => {
                    res.status(200).json(product);
                })
                .catch(err => {
                    res.status(404).json(err);
                });
        })
        .catch(err => {
            res.status(400).json(err);
        });
};

// ========== ELIMINAR UN PRODUCTO ==========
const productsDeleteOne = (req, res) => {
    const productid = req.params.productid;
    if (productid) {
        Product
            .findByIdAndDelete(productid)
            .exec()
            .then(product => {
                if (!product) {
                    res.status(404).json({ "message": "Producto no encontrado" });
                } else {
                    res.status(200).json(product);
                }
            })
            .catch(err => {
                res.status(404).json(err);
            });
    } else {
        res.status(404).json({ "message": "No se encontró productid" });
    }
};

module.exports = {
    productsList,
    productsCreate,
    productsReadOne,
    productsUpdateOne,
    productsDeleteOne
};