const express = require('express');
const router = express.Router();
const health = require('../controllers/healthController');
const clients = require('./clients');
const screens = require('./screens');

router.get('/health', health.getHealth);

router.use('/clients', clients);
router.use('/screens', screens);

module.exports = router;
