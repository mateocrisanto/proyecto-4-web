const express = require('express');
const router = express.Router();

const ctrlMain = require('../controllers/main');
const ctrlUsers = require('../controllers/users');

/* GET users listing. */
router.get('/', ctrlMain.usersController);

// registro de clientes
router.get('/add', ctrlUsers.usersAdd);
router.post('/add', ctrlUsers.usersDoAdd);

// perfil de cliente
router.get('/profile/:userId', ctrlUsers.userProfile);

// edición de clientes
router
    .route('/edit/:userId')
    .get(ctrlUsers.usersEdit)
    .post(ctrlUsers.doUsersEdit);

// eliminación de clientes
router
    .route('/delete/:userId')
    .get(ctrlUsers.usersDelete)
    .post(ctrlUsers.doUsersDelete);




module.exports = router;
