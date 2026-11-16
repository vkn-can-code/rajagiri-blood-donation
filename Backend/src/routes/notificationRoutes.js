const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const notificationController = require('../controllers/notificationController');

router.use(protect); // All routes require login

router.get('/', notificationController.getMyNotifications);
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;