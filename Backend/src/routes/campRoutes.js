const express = require('express');
const router = express.Router();
const campController = require('../controllers/campController');
// Import middleware
const { protect, authorize, checkPermission } = require('../middlewares/authMiddleware');

// @route   GET /api/camps
// @desc    Get all upcoming camps
// @access  Public
router.get('/', campController.getAllCamps);

// @route   POST /api/camps
// @desc    Create a new camp
// @access  Private (Admin, Volunteer, Super Admin)
router.post('/', 
  protect, 
  authorize('admin', 'volunteer', 'super_admin'), 
  // Custom check: If user is specifically an 'admin', check their permission.
  // Volunteers and Super Admins pass through automatically.
  (req, res, next) => {
    if (req.user.role === 'admin') {
      const perms = req.user.permissions || {};
      // If manage_camps is not explicitly true, deny
      if (perms.manage_camps !== true) {
         return res.status(403).json({ message: "Access Denied: You do not have permission to manage camps." });
      }
    }
    next();
  },
  campController.createCamp
);

// --- NEW ROUTES FOR CAMP DETAILS PAGE ---

// @route   GET /api/camps/:id
// @desc    Get details for a single camp
// @access  Private (Admin, Super Admin)
router.get('/:id', 
  protect, 
  authorize('admin', 'super_admin'), 
  checkPermission('manage_camps'),
  campController.getCampById
);

// @route   GET /api/camps/:id/donations
// @desc    Get all donations (participants) for a specific camp
// @access  Private (Admin, Super Admin)
router.get('/:id/donations', 
  protect, 
  authorize('admin', 'super_admin'), 
  checkPermission('manage_camps'),
  campController.getCampDonations
);

// @route   POST /api/camps/:id/data-entry
// @desc    Admin/Volunteer records an on-site donation at the camp
// @access  Private (Admin, Super Admin, Volunteer)
router.post('/:id/data-entry',
  protect,
  authorize('admin', 'super_admin', 'volunteer'),
  campController.recordCampDonation
);


// @route   PUT /api/camps/:id
// @desc    Update a camp's details
// @access  Private (Admin, Super Admin)
router.put('/:id', 
  protect, 
  authorize('admin', 'super_admin'), 
  checkPermission('manage_camps'),
  campController.updateCamp
);

// @route   DELETE /api/camps/:id
// @desc    Admin deletes a camp
// @access  Private (Admin, Super Admin)
router.delete('/:id', 
  protect, 
  authorize('admin', 'super_admin'), 
  checkPermission('manage_camps'),
  campController.deleteCamp
);

// --- CAMP REGISTRATIONS ---

// @route   POST /api/camps/:id/register
// @desc    User registers for a camp (submitting eligibility questionnaire)
// @access  Private (All logged-in users)
router.post('/:id/register',
  protect,
  campController.registerForCamp
);

// @route   GET /api/camps/:id/registrations
// @desc    Admin gets all registrations for a camp
// @access  Private (Admin, Super Admin)
router.get('/:id/registrations',
  protect,
  authorize('admin', 'super_admin'),
  checkPermission('manage_camps'),
  campController.getCampRegistrations
);

// @route   PUT /api/camps/:id/registrations/:regId/status
// @desc    Admin approves/rejects a registration
// @access  Private (Admin, Super Admin)
router.put('/:id/registrations/:regId/status',
  protect,
  authorize('admin', 'super_admin'),
  checkPermission('manage_camps'),
  campController.updateRegistrationStatus
);

module.exports = router;