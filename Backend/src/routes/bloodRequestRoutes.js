const express = require('express');
const router = express.Router();
// --- FIX: Import checkPermission so we can verify admin privileges ---
const { protect, authorize, checkPermission } = require('../middlewares/authMiddleware');
const requestController = require('../controllers/bloodRequestController');

// --- PUBLIC ROUTE ---
// Anyone can see open requests
router.get('/', requestController.getAllOpenRequests);

// --- ADMIN & SUPER ADMIN ROUTES ---

// Create a request
router.post('/',
  protect,
  // --- FIX: Allow 'super_admin' here ---
  authorize('admin', 'super_admin'),
  // Ensure regular admins have the right permission
  checkPermission('manage_requests'),
  requestController.createRequest
);

// Edit a request
router.put('/:requestId',
  protect,
  authorize('admin', 'super_admin'),
  checkPermission('manage_requests'),
  requestController.updateRequest
);

// Delete a request
router.delete('/:requestId',
  protect,
  authorize('admin', 'super_admin'),
  checkPermission('manage_requests'),
  requestController.deleteRequest
);

// Update status
router.patch('/:requestId/status',
  protect,
  authorize('admin', 'super_admin'),
  checkPermission('manage_requests'),
  requestController.updateRequestStatus
);

// --- NEW: Request List for Admin/Faculty ---
router.get('/admin/all',
  protect,
  authorize('admin', 'faculty_admin', 'super_admin'),
  requestController.getAllRequestsAdmin
);

// --- NEW: Grant Certificate ---
router.patch('/response/:responseId/grant-certificate',
  protect,
  authorize('admin', 'faculty_admin', 'super_admin'),
  requestController.grantCertificate
);

// --- USER ROUTES ---
// A logged-in user responds to a request
router.post('/:requestId/respond', protect, requestController.respondToRequest);

module.exports = router;