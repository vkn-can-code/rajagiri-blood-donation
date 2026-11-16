const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const volunteerController = require('../controllers/volunteerController');

// All routes here are for 'volunteer' or 'admin'
router.use(protect, authorize('volunteer', 'admin'));

// @desc    Get all "new" responses to all blood requests (Req 6)
// @route   GET /api/volunteer/responses
// @access  Volunteer, Admin
router.get('/responses', volunteerController.getNewResponses);

// @desc    Mark a specific response as "contacted" (Req 6)
// @route   PATCH /api/volunteer/responses/:responseId/contacted
// @access  Volunteer, Admin
router.patch('/responses/:responseId/contacted', volunteerController.markResponseAsContacted);

module.exports = router;