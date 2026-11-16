const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

// @desc    Get the logged-in user's own profile
// @route   GET /api/users/me
// @access  Private (all roles)
router.get('/me', protect, userController.getMyProfile);
router.put('/me', protect, userController.updateUserProfile);

module.exports = router;