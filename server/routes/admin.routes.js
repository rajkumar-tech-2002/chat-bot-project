const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Protect all admin routes
router.use(verifyToken);

router.get('/stats', adminController.getStats);
router.get('/activity', adminController.getActivityLogs);
router.get('/visitors', adminController.getVisitors);

module.exports = router;
