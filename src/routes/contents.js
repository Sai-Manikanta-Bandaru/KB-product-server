const express = require('express');
const router = express.Router();
const contentCtrl = require('../controllers/contentController');
const upload = require('../utils/contentUpload');

// Upload content (multipart/form-data): field 'screenId' and file field 'media'
router.post('/', upload.single('media'), contentCtrl.uploadContent);

// Get all contents
router.get('/', contentCtrl.getContents);

// Get content by id
router.get('/:id', contentCtrl.getContentById);

// Activate / deactivate content
router.put('/:id/activate', contentCtrl.activateContent);

// Soft delete
router.delete('/:id', contentCtrl.deleteContent);

module.exports = router;
