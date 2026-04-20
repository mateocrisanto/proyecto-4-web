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

const { requestApi } = require('../lib/apiClient');
const siteContent = require('../config/siteContent');

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
        title: siteContent.users.createTitle,
        message: siteContent.users.createMessage
  });
};

// ========== CONTROLADOR: PROCESAR REGISTRO DE CLIENTE ==========
// POST /users/add
// Recibe datos del formulario de registro y los envía a la API
const usersDoAdd = async (req, res) => {
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

    try {
        const { ok, status, body } = await requestApi('/api/users', {
            method: 'POST',
            body: JSON.stringify(postData)
        });

        if (ok && status === 201) {
            res.render('usersCreate', {
                message: siteContent.users.createSuccessMessage(body?._id || ''),
                title: siteContent.users.createTitle,
                action: '/users/add',
                submitText: 'Enviar registro',
                user: {}
            });
            return;
        }

        console.log('Error al registrar cliente: ', status, body);
        res.render('error', {
            message: siteContent.users.registrationError,
            error: { status }
        });
    } catch (err) {
        console.log('Error al registrar cliente: ', err);
        res.render('error', {
            message: siteContent.users.registrationError,
            error: { status: 500 }
        });
    }
};

// ========== FUNCIÓN AUXILIAR: RENDERIZAR FORMULARIO DE USUARIO ==========
// Reutiliza la vista de creación para edición y creación con valores dinámicos
const renderUsersForm = (req, res, responseBody, action, submitText) => {
    res.render('usersCreate', {
        title: action.includes('/edit/') ? siteContent.users.editTitle : siteContent.users.createTitle,
        message: action.includes('/edit/') ? siteContent.users.editMessage : siteContent.users.createMessage,
        action,
        submitText,
        user: responseBody
    });
};

// ========== CONTROLADOR: OBTENER CLIENTE PARA EDITAR ==========
// GET /users/edit/:userId
const usersEdit = async (req, res) => {
    try {
        const { ok, status, body } = await requestApi(`/api/users/${req.params.userId}`, {
            method: 'GET'
        });

        if (ok && body) {
            renderUsersForm(req, res, body, `/users/edit/${req.params.userId}`, 'Guardar cambios');
            return;
        }

        console.log('Status code: ', status);
        res.render('error', { message: siteContent.users.notFound, error: { status } });
    } catch (err) {
        console.log('Error: ', err);
        res.render('error', { message: siteContent.users.searchError, error: { status: 500 } });
    }
};

// ========== CONTROLADOR: ENVIAR CAMBIOS DE EDICIÓN ==========
// POST /users/edit/:userId
const doUsersEdit = async (req, res) => {
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

    try {
        const { ok, status, body } = await requestApi(`/api/users/${req.params.userId}`, {
            method: 'PUT',
            body: JSON.stringify(postData)
        });

        if (ok && status === 200) {
            renderUsersForm(req, res, body, `/users/edit/${req.params.userId}`, 'Guardar cambios');
            return;
        }

        console.log('Error: ', status, body);
        res.render('error', {
            message: siteContent.users.updateError,
            error: { status }
        });
    } catch (err) {
        console.log('Error: ', err);
        res.render('error', {
            message: siteContent.users.updateError,
            error: { status: 500 }
        });
    }
};

// ========== FUNCIÓN AUXILIAR: RENDERIZAR PÁGINA DE ELIMINACIÓN ==========
// Muestra los detalles del cliente a eliminar para confirmación
const renderUsersDelete = (req, res, responseBody) => {
    res.render('usersDelete', {
        title: siteContent.users.deleteTitle,
        message: siteContent.users.deleteMessage,
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
const usersDelete = async (req, res) => {
    try {
        const { ok, status, body } = await requestApi(`/api/users/${req.params.userId}`, {
            method: 'GET'
        });

        if (ok && body) {
            renderUsersDelete(req, res, body);
            return;
        }

        console.log('Status code: ', status);
        res.render('error', { message: siteContent.users.notFound, error: { status } });
    } catch (err) {
        console.log('Error: ', err);
        res.render('error', { message: siteContent.users.searchError, error: { status: 500 } });
    }
};

// ========== CONTROLADOR: CONFIRMAR ELIMINACIÓN DE CLIENTE ==========
// POST /users/delete/:userId
// Envía petición DELETE a la API para eliminar el cliente
const doUsersDelete = async (req, res) => {
    try {
        const { ok, status } = await requestApi(`/api/users/${req.params.userId}`, {
            method: 'DELETE'
        });

        if (ok && status === 204) {
        console.log(siteContent.users.deleteSuccess);
        res.redirect('/users');
        return;
        }

        console.log('Status code: ', status);
        res.render('error', { message: siteContent.users.deleteError, error: { status } });
    } catch (err) {
        console.log('Error: ', err);
        res.render('error', { message: siteContent.users.deleteError, error: { status: 500 } });
    }
};

// ========== FUNCIÓN AUXILIAR: RENDERIZAR PÁGINA DE PERFIL ==========
// Muestra los datos completos del cliente
const renderUserProfile = (req, res, responseBody) => {
    res.render('perfil', {
        title: siteContent.users.profileTitle,
        user: responseBody  // Pasar todo el objeto del cliente a la vista
    });
};

// ========== CONTROLADOR: VER PERFIL DEL CLIENTE ==========
// GET /users/profile/:userId
// Obtiene los datos del cliente desde la API y muestra su perfil
const userProfile = async (req, res) => {
    try {
        const { ok, status, body } = await requestApi(`/api/users/${req.params.userId}`, {
            method: 'GET'
        });

        if (ok && body) {
            renderUserProfile(req, res, body);
            return;
        }

        console.log('Status code: ', status);
        res.render('error', { message: siteContent.users.notFound, error: { status } });
    } catch (err) {
        console.log('Error: ', err);
        res.render('error', { message: siteContent.users.profileError, error: { status: 500 } });
    }
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