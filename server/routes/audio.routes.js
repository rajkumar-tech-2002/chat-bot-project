const express = require('express');
const router = express.Router();
const { upload, saveAudio } = require('../controllers/audio.controller');

// POST /api/audio/save — receives audio file + transcript text
router.post('/save', upload.single('audio'), saveAudio);

module.exports = router;
