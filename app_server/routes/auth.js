const express = require('express');
const router = express.Router();
const ctrlAuth = require('../controllers/auth');

router.get('/login', ctrlAuth.showLogin);
router.post('/login', ctrlAuth.doLogin);
router.get('/register', ctrlAuth.showRegister);
router.post('/register', ctrlAuth.doRegister);
router.get('/logout', ctrlAuth.logout);
router.get('/guest', ctrlAuth.guestAccess);

module.exports = router;
