const express = require('express');
const router = express.Router();
const multer = require('multer');
const documentController = require('../controllers/document.controller');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('document'), documentController.uploadDocument);
router.get('/', documentController.getDocuments);
router.delete('/clear', documentController.clearKnowledgeBase);
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
