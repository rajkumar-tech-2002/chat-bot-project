const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitor.controller');

router.post('/', visitorController.create);
router.get('/lookup/:mobile', visitorController.lookup);
router.get('/', visitorController.findAll);

module.exports = router;
