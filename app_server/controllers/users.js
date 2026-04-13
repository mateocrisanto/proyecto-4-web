/**
 * CONTROLADORES DEL SERVIDOR - OPERACIONES DE USUARIOS
 * =====================================================
 * Maneja: Registro de clientes, Eliminación de clientes, Perfil del cliente
 * 
 * Estos controladores:
 * 1. Reciben datos de formularios
 * 2. Hacen peticiones POST/GET a la API REST
 * 3. Muestran respuestas al usuario
 */

// Módulo para hacer peticiones HTTP a la API REST
const request = require('request');

// ========== CONFIGURACIÓN DE AMBIENTES ==========
let apiOptions = {
  server: 'http://localhost:3000' // Servidor local para desarrollo
};
if (process.env.NODE_ENV === 'production') {
  apiOptions.server = 'https://dw3-202520.herokuapp.com'; // Servidor en producción
}

// ========== FUNCIÓN AUXILIAR: CONVERTIR A ARRAY ==========
// Si recibe un valor simple, lo convierte a array
// Si ya es array, lo deja igual
// Si es undefined, retorna array vacío
const toArray = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

// ========== CONTROLADOR: MOSTRAR FORMULARIO DE REGISTRO ==========
// GET /users/add
// Renderiza la página con el formulario para registrar un nuevo cliente
const usersAdd = (req, res) => {
  res.render('usersCreate', { 
    title: 'Registro de Cliente', 
    message: 'Registra tu servicio de Internet, telefonía y canales internacionales' 
  });
};

// ========== CONTROLADOR: PROCESAR REGISTRO DE CLIENTE ==========
// POST /users/add
// Recibe datos del formulario de registro y los envía a la API
const usersDoAdd = (req, res) => {
    const path = '/api/users';  // Endpoint para crear nuevo cliente
    
    // Preparar los datos del cliente en formato JSON
    const postData = {
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        identificacion: req.body.identificacion,
        direccion: req.body.direccion,
        telefono: req.body.telefono,
        email: req.body.email,
        // Convertir selecciones múltiples a arrays usando toArray()
        services: {
            internetPlans: toArray(req.body.internetPlans),       // Planes de internet seleccionados
            phonePlans: toArray(req.body.phonePlans),             // Servicios telefónicos seleccionados
            mobilePlans: toArray(req.body.mobilePlans),           // Planes celulares seleccionados
            internationalChannels: toArray(req.body.internationalChannels) // Canales seleccionados
        }
    };
    
    console.log('Post data: ', postData); // Log para debugging
    
    // Configurar la petición HTTP POST a la API
    const requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'POST',         // Crear nuevo recurso
        json: postData           // Enviar datos convertidos a JSON
    };
    
    console.log('Request options: ', requestOptions);
    
    // Enviar petición a la API
    request(requestOptions, (err, response, body) => {
        if (!err && response.statusCode === 201) {
            // Éxito: cliente creado correctamente
            console.log('Body: ', body);
            res.render('usersCreate', {
                message: 'Cliente registrado exitosamente. ID: ' + body._id, // Mostrar ID generado
                title: 'Registro de Cliente',
                action: '/users/add',
                submitText: 'Enviar registro',
                user: {}
            });
        } else {
            // Error: mostrar página de error
            console.log('Error: ', err || body);
            res.render('error', {
                message: 'Error al registrar el cliente', 
                error: {status: response && response.statusCode}
            });
        }
    });
};

// ========== FUNCIÓN AUXILIAR: RENDERIZAR FORMULARIO DE USUARIO ==========
// Reutiliza la vista de creación para edición y creación con valores dinámicos
const renderUsersForm = (req, res, responseBody, action, submitText) => {
    res.render('usersCreate', {
        title: action.includes('/edit/') ? 'Editar Cliente' : 'Registro de Cliente',
        message: action.includes('/edit/') ? 'Modifica los datos del cliente' : 'Registra tu servicio de Internet, telefonía y canales internacionales',
        action,
        submitText,
        user: responseBody
    });
};

// ========== CONTROLADOR: OBTENER CLIENTE PARA EDITAR ==========
// GET /users/edit/:userId
const usersEdit = (req, res) => {
    const path = `/api/users/${req.params.userId}`; // Endpoint para obtener cliente específico
    const requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'GET',
        json: true
    };
    request(requestOptions, (err, response, body) => {
        if (err) {
            console.log('Error: ', err);
            res.render('error', {message: 'Error al buscar el cliente', error: {status: response && response.statusCode}});
        } else if (response.statusCode === 200 && body) {
            renderUsersForm(req, res, body, `/users/edit/${req.params.userId}`, 'Guardar cambios');
        } else {
            console.log('Status code: ', response.statusCode);
            res.render('error', {message: 'Cliente no encontrado', error: {status: response.statusCode}});
        }
    });
};

// ========== CONTROLADOR: ENVIAR CAMBIOS DE EDICIÓN ==========
// POST /users/edit/:userId
const doUsersEdit = (req, res) => {
    const path = `/api/users/${req.params.userId}`;  // Endpoint para actualizar cliente
    const postData = {
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        identificacion: req.body.identificacion,
        direccion: req.body.direccion,
        telefono: req.body.telefono,
        email: req.body.email,
        services: {
            internetPlans: toArray(req.body.internetPlans),
            phonePlans: toArray(req.body.phonePlans),
            mobilePlans: toArray(req.body.mobilePlans),
            internationalChannels: toArray(req.body.internationalChannels)
        }
    };
    const requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'PUT',
        json: postData
    };
    request(requestOptions, (err, response, body) => {
        if (!err && response.statusCode === 200) {
            console.log('Body: ', body);
            renderUsersForm(req, res, body, `/users/edit/${req.params.userId}`, 'Guardar cambios');
        } else {
            console.log('Error: ', err || body);
            res.render('error', {
                message: 'Error al actualizar el cliente', 
                error: {status: response && response.statusCode}
            });
        }
    });
};

// ========== FUNCIÓN AUXILIAR: RENDERIZAR PÁGINA DE ELIMINACIÓN ==========
// Muestra los detalles del cliente a eliminar para confirmación
const renderUsersDelete = (req, res, responseBody) => {
    res.render('usersDelete', {
        title: 'Eliminación de Clientes',
        message: 'Eliminar cliente registrado',
        nombre: responseBody.nombre,
        apellido: responseBody.apellido,
        identificacion: responseBody.identificacion,
        direccion: responseBody.direccion,
        telefono: responseBody.telefono,
        email: responseBody.email,
        services: responseBody.services,
        fecha: responseBody.creado
    });
};

// ========== CONTROLADOR: OBTENER CLIENTE PARA ELIMINAR ==========
// GET /users/delete/:userId
// Obtiene datos del cliente desde la API y muestra página de confirmación
const usersDelete = (req, res) => {
    const path = `/api/users/${req.params.userId}`; // Endpoint para obtener cliente específico
    const requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'GET',
        json: true
    };
    request(requestOptions, (err, response, body) => {
        if (err) {
            console.log('Error: ', err);
            res.render('error', {message: 'Error al buscar el cliente', error: {status: response && response.statusCode}});
        } else if (response.statusCode === 200 && body) {
            // Cliente encontrado: mostrar página de confirmación
            renderUsersDelete(req, res, body);
        } else {
            console.log('Status code: ', response.statusCode);
            res.render('error', {message: 'Cliente no encontrado', error: {status: response.statusCode}});
        }
    });
};

// ========== CONTROLADOR: CONFIRMAR ELIMINACIÓN DE CLIENTE ==========
// POST /users/delete/:userId
// Envía petición DELETE a la API para eliminar el cliente
const doUsersDelete = (req, res) => {
    const path = `/api/users/${req.params.userId}`;  // Endpoint para eliminar cliente
    const requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'DELETE',       // Usar método DELETE
        json: {}
    };
    request(requestOptions, (err, response, body) => {
        if (err) {
            console.log('Error: ', err);
            res.render('error', {message: 'Error al eliminar el cliente', error: {status: response && response.statusCode}});
        } else if (response.statusCode === 204) {
            // Éxito: cliente eliminado, redirigir a lista de clientes
            console.log('Cliente eliminado exitosamente');
            res.redirect('/users');
        } else {
            console.log('Status code: ', response.statusCode);
            res.render('error', {message: 'Error al eliminar el cliente', error: {status: response.statusCode}});
        }
    });
};

// ========== FUNCIÓN AUXILIAR: RENDERIZAR PÁGINA DE PERFIL ==========
// Muestra los datos completos del cliente
const renderUserProfile = (req, res, responseBody) => {
    res.render('perfil', {
        title: 'Perfil de Cliente',
        user: responseBody  // Pasar todo el objeto del cliente a la vista
    });
};

// ========== CONTROLADOR: VER PERFIL DEL CLIENTE ==========
// GET /users/profile/:userId
// Obtiene los datos del cliente desde la API y muestra su perfil
const userProfile = (req, res) => {
    const path = `/api/users/${req.params.userId}`; // Endpoint para obtener cliente específico
    const requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'GET',
        json: true
    };
    request(requestOptions, (err, response, body) => {
        if (err) {
            console.log('Error: ', err);
            res.render('error', {message: 'Error al cargar el perfil', error: {status: response && response.statusCode}});
        } else if (response.statusCode === 200 && body) {
            // Éxito: mostrar perfil del cliente
            renderUserProfile(req, res, body);
        } else {
            console.log('Status code: ', response.statusCode);
            res.render('error', {message: 'Cliente no encontrado', error: {status: response.statusCode}});
        }
    });
};

module.exports = {
  usersAdd,         // GET /users/add - Mostrar formulario de registro de cliente
  usersDoAdd,       // POST /users/add - Procesar registro de nuevo cliente
  usersEdit,        // GET /users/edit/:userId - Mostrar formulario para editar cliente
  doUsersEdit,      // POST /users/edit/:userId - Enviar cambios de edición del cliente
  usersDelete,      // GET /users/delete/:userId - Mostrar página de confirmación de eliminación
  doUsersDelete,    // POST /users/delete/:userId - Ejecutar la eliminación del cliente
  userProfile       // GET /users/profile/:userId - Ver el perfil completo del cliente
};