const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const donationController = require('../controllers/donationController');
const upload = require('../middlewares/uploadMiddleware'); // Assumes multer is configured

// @desc    A user uploads their own donation certificate
// @route   POST /api/donations
// @access  Private (all roles)
router.post(
  '/',
  protect,
  upload.single('certificate'), // Use multer for the file
  donationController.createDonation
);

// @desc    A user gets their own donation history
// @route   GET /api/donations/me
// @access  Private (all roles)
router.get('/me', protect, donationController.getMyDonations);

module.exports = router;