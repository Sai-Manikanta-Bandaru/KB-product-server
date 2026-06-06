const express = require('express');
const router = express.Router();
const health = require('../controllers/healthController');
const clients = require('./clients');

router.get('/health', health.getHealth);

router.use('/clients', clients);

module.exports = router;
