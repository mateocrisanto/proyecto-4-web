/**
 * CONTROLADORES REST API - OPERACIONES SOBRE CLIENTES
 * ====================================================
 * Estos controladores manejan todas las operaciones de la API REST
 * HTTP Methods: GET (leer), POST (crear), PUT (actualizar), DELETE (eliminar)
 * 
 * Ruta base: /api/users
 */

// Importar mongoose para acceder a la base de datos
const mongoose = require('mongoose');
// Obtener el modelo 'user' (compilado en esquema_users.js)
const users = mongoose.model('user');
// ========== CREAR UN NUEVO CLIENTE ==========
// POST /api/users
// Recibe datos del cliente desde req.body (viene del formulario de registro)
// Valida y almacena en MongoDB
const usersCreate = (req, res) => {
    // Crear nuevo documento en MongoDB con los datos recibidos
    users.create({ 
        // Datos personales del cliente
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        identificacion: req.body.identificacion,
        direccion: req.body.direccion,
        telefono: req.body.telefono,
        email: req.body.email,
        
        // Servicios contratados: usar operador || para manejar alternativas
        // Esto permite que funcione si llegan como services.internetPlans o directamente internetPlans
        services: {
            internetPlans: req.body.services?.internetPlans || req.body.internetPlans || [],
            phonePlans: req.body.services?.phonePlans || req.body.phonePlans || [],
            mobilePlans: req.body.services?.mobilePlans || req.body.mobilePlans || [],
            internationalChannels: req.body.services?.internationalChannels || req.body.internationalChannels || []
        }
    })
        .then((objetoUsuario) => { 
            // Éxito: el cliente fue creado correctamente
            // Responder con código 201 (Created) y los datos del cliente creado
            res.status(201).json(objetoUsuario);
        })
        .catch((err) => { 
            // Error: hubo un problema al crear el cliente (validación, conexión, etc)
            // Responder con código 500 (Server Error) y detalles del error
            res.status(500).json(err);
            console.log('Error al crear el usuario');
        });
};

// ========== OBTENER TODOS LOS CLIENTES ==========
// GET /api/users
// Retorna una lista de todos los clientes registrados en la base de datos
const usersList = (req, res) => {
    users
        .find() // Sin parámetros: obtiene TODOS los documentos
        // .find({'nombre': 'Mateo'}) -- Ejemplo: buscar específicamente
        // .select('nombre apellido direccion') -- Ejemplo: seleccionar solo ciertos campos
        .exec()
        .then((objetoUsuarios) => {
            if (!objetoUsuarios) { 
                // No se encontraron clientes
                console.log('No se encontraron usuarios');
                res.status(404).json({
                    "status": "error",
                    "message": "No se encontraron usuarios"
                });
                return;
            } else { 
                // Éxito: retorna todos los clientes con código 200 (OK)
                res.status(200).json(objetoUsuarios);
            }
        })
        .catch((err) => { 
            // Error en la consulta
            res.status(500).json(err);
            console.log('Error al listar los usuarios');
        });
};

// búsqueda de usuarios por ocurrencia/coincidencia especifica 
const usersFindName = (req, res) => {
    // creación de la expresión regular para la búsqueda de usuarios por ocurrencia
    const buscar = new RegExp(req.params.name, 'i'); // la i es para que no distinga entre mayúsculas y minúsculas
    users
        // búsqueda de usuarios por ocurrencia
        // .find({ 'nombre': buscar })

        // búsqueda de usuarios por coincidencia especifica
        .find({
            'identificacion': req.params.name
        })
        .exec()
        .then((objetoUsuarios) => {
            if (!objetoUsuarios) { // find no encontró ningún usuario
                console.log('No se encontraron usuarios');
                res // no existen documentos en la colección users
                    .status(404)
                    .json({
                        "status": "error",
                        "message": "No se encontraron usuarios"
                    });
                return;
            } else  // find encontró usuarios
                res
                    .status(200)
                    .json(objetoUsuarios);
        })
        .catch((err) => { // find encontró un error
            res
                .status(500)
                .json(err);
            console.log('Error al listar los usuarios');
        });
};

// ========== OBTENER UN CLIENTE ESPECÍFICO ==========
// GET /api/users/:userId
// Busca y retorna un único cliente por su ID (ObjectId de MongoDB)
const usersRead = (req, res) => {
    users
        .findById(req.params.userId) // req.params.userId viene de la URL (/api/users/123abc)
        .exec()
        .then((objetoUsuario) => {
            if (!objetoUsuario) {
                // No existe cliente con ese ID
                res.status(404).json({
                    status: 'error',
                    message: 'No se encontró el usuario con Id: ' + req.params.userId
                });
            } else {
                // Éxito: retorna el cliente encontrado
                res.status(200).json(objetoUsuario);
            }
        })
        .catch((err) => { 
            // Error en la búsqueda (ej: ID inválido)
            res.status(500).json(err);
            console.log('Error al buscar el usuario con Id: ' + req.params.userId);
        });
};

// ========== ACTUALIZAR UN CLIENTE EXISTENTE ==========
// PUT /api/users/:userId
// Busca un cliente y actualiza sus datos
const usersUpdate = (req, res) => {
    users
        .findById(req.params.userId) // Buscar el cliente por ID
        .exec()
        .then((objetoUsuario) => {
            if (!objetoUsuario) { 
                // No existe cliente con ese ID
                console.log('No se encontró el usuario con Id: ' + req.params.userId);
                res.status(404).json({
                    "status": "error",
                    "message": "No se encontró el usuario con Id: " + req.params.userId
                });
                return;
            } else { 
                // Cliente encontrado: actualizar sus campos
                objetoUsuario.nombre = req.body.nombre;
                objetoUsuario.apellido = req.body.apellido;
                objetoUsuario.identificacion = req.body.identificacion;
                objetoUsuario.direccion = req.body.direccion;
                objetoUsuario.telefono = req.body.telefono;
                objetoUsuario.email = req.body.email;
                // Actualizar servicios del cliente
                objetoUsuario.services = {
                    internetPlans: req.body.services?.internetPlans || req.body.internetPlans || [],
                    phonePlans: req.body.services?.phonePlans || req.body.phonePlans || [],
                    mobilePlans: req.body.services?.mobilePlans || req.body.mobilePlans || [],
                    internationalChannels: req.body.services?.internationalChannels || req.body.internationalChannels || []
                };
                // Guardar los cambios en MongoDB
                objetoUsuario
                    .save()
                    .then((users) => { 
                        // Éxito: cliente actualizado y guardado
                        res.status(200).json(users);
                    })
                    .catch((err) => { 
                        // Error al guardar los cambios
                        res.status(500).json(err);
                        console.log('Error al actualizar el usuario con Id: ' + req.params.userId);
                    });
            }
        })
        .catch((err) => { 
            // Error en la búsqueda o actualización
            res.status(500).json(err);
            console.log('Error al actualizar el usuario con Id: ' + req.params.userId);
        });
};

// ========== ELIMINAR UN CLIENTE ESPECÍFICO ==========
// DELETE /api/users/:userId
// Busca un cliente por ID y lo elimina de la base de datos
const usersDelete = (req, res) => {
    users
        .findByIdAndDelete(req.params.userId) // Buscar y eliminar de un solo paso
        .exec()
        .then((objetoUsuario) => {
                if (!objetoUsuario) { 
                    // No existe cliente con ese ID
                    console.log('No se encontró el usuario con Id: ' + req.params.userId);
                    res.status(404).json({
                        "status": "error",
                        "message": "No se encontró el usuario con Id: " + req.params.userId
                    });
                    return;
                } else { 
                    // Éxito: cliente eliminado correctamente
                    // Responder con código 204 (No Content) sin cuerpo
                    res.status(204).json(null);
                }
        })
        .catch((err) => { 
            // Error al eliminar (ej: ID inválido, problema de conexión)
            res.status(500).json(err);
            console.log('Error al eliminar el usuario con Id: ' + req.params.userId);
        });
};

module.exports = {
    usersCreate,      // POST /api/users - Registrar nuevo cliente
    usersList,        // GET /api/users - Listar todos los clientes
    usersFindName,    // GET /api/search/:name - Buscar cliente por identificación
    usersRead,        // GET /api/users/:userId - Obtener un cliente específico
    usersUpdate,      // PUT /api/users/:userId - Actualizar cliente
    usersDelete       // DELETE /api/users/:userId - Eliminar cliente
};  