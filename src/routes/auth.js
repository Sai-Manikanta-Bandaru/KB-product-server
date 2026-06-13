const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const auth = require('../middleware/auth');

// Login
router.post('/login', authCtrl.login);

// Current user
router.get('/me', auth, authCtrl.me);

module.exports = router;
