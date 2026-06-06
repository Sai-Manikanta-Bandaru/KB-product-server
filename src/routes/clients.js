const express = require('express');
const router = express.Router();
const clientCtrl = require('../controllers/clientController');

// Create client
router.post('/', clientCtrl.createClient);

// Get all clients (non-deleted)
router.get('/', clientCtrl.getClients);

// Get client details
router.get('/:id', clientCtrl.getClientById);

// Update client
router.put('/:id', clientCtrl.updateClient);

// Soft delete client
router.delete('/:id', clientCtrl.deleteClient);

module.exports = router;
