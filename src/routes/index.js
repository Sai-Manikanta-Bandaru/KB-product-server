const express = require('express');
const router = express.Router();
const health = require('../controllers/healthController');
const clients = require('./clients');
const screens = require('./screens');
const contents = require('./contents');
const player = require('./player');
const auth = require('./auth');

router.get('/health', health.getHealth);

router.use('/clients', clients);
router.use('/screens', screens);
router.use('/contents', contents);
router.use('/player', player);
router.use('/auth', auth);

module.exports = router;
