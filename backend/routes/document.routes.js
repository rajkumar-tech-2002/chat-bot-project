const express = require('express');
const router = express.Router();
const multer = require('multer');
const documentController = require('../controllers/document.controller');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('document'), documentController.uploadDocument);
router.delete('/clear', (req, res) => {
  const aiService = require('../services/ai.service');
  aiService.clearStore();
  res.json({ message: "AI Knowledge Base cleared successfully." });
});

module.exports = router;
