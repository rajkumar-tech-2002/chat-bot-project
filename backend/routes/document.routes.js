const express = require('express');
const router = express.Router();
const multer = require('multer');
const documentController = require('../controllers/document.controller');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('document'), documentController.uploadDocument);

module.exports = router;
