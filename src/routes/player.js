const express = require('express');
const router = express.Router();
const playerCtrl = require('../controllers/playerController');

// GET /player?clientSlug=...&screenSlug=...
router.get('/', playerCtrl.getPlayerContent);

module.exports = router;
