const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// --- NEW ---
// Import the validation middleware
const { validateRegister, runValidation } = require('../middlewares/validationMiddleware');
// --- END NEW ---

// @route   POST /api/auth/login
// @desc    Login for all user roles
// @access  Public
router.post('/login', authController.login);

// --- NEW ROUTE ---
// @route   POST /api/auth/register
// @desc    Register a new user (as 'student')
// @access  Public
router.post(
  '/register',
  validateRegister, // 1. Run validation checks
  runValidation,    // 2. Stop if validation fails
  authController.register // 3. Proceed to controller
);
// --- END NEW ROUTE ---

// @route   POST /api/auth/change-password
// @desc    Change password on first login (clears is_first_login flag)
// @access  Protected
router.post('/change-password', protect, authController.changePassword);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', authController.forgotPassword);

// @route   GET /api/auth/verify-reset-token/:token
// @desc    Verify if the reset token is valid
// @access  Public
router.get('/verify-reset-token/:token', authController.verifyResetToken);

// @route   POST /api/auth/reset-password
// @desc    Reset password using token from email
// @access  Public
router.post('/reset-password', authController.resetPassword);

module.exports = router;