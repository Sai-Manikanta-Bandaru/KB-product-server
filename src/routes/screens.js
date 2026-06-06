const express = require('express');
const router = express.Router();
const screenCtrl = require('../controllers/screenController');

// Create screen (clientId in body)
router.post('/', screenCtrl.createScreen);

// Get all screens (non-deleted)
router.get('/', screenCtrl.getScreens);

// Get screen details
router.get('/:id', screenCtrl.getScreenById);

// Update screen
router.put('/:id', screenCtrl.updateScreen);

// Soft delete screen
router.delete('/:id', screenCtrl.deleteScreen);

module.exports = router;
