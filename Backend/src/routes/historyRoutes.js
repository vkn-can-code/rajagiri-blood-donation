const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const historyController = require('../controllers/historyController');

// @route   GET /api/history/admin
router.get('/admin', 
  protect, 
  authorize('admin', 'super_admin'), 
  historyController.getAdminHistory
);

// @route   GET /api/history/faculty/department-donations
router.get(
  '/faculty/department-donations', 
  protect, 
  authorize('faculty_admin'), 
  historyController.getFacultyHistory
);

// @route   GET /api/history/user/:userId
// @desc    Get complete analytics for a specific user
// @access  Admin, Super Admin, Faculty Admin
router.get(
  '/user/:userId',
  protect,
  authorize('admin', 'super_admin', 'faculty_admin'),
  historyController.getUserAnalytics
);

module.exports = router;