const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

router.post('/basic', chatController.basicChat);
router.post('/rag', chatController.ragChat);

module.exports = router;
