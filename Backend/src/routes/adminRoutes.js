const express = require('express');
const router = express.Router();

// --- FIX: Import 'checkPermission' ---
const { protect, authorize, requireSuperAdmin, checkPermission } = require('../middlewares/authMiddleware');
const adminController = require('../controllers/adminController');
const batchController = require('../controllers/batchController');
const departmentController = require('../controllers/departmentController');
const emailController = require('../controllers/emailController'); // <-- NEW EMAIL CTRLR
const upload = require('../middlewares/uploadMiddleware');

// === USER MANAGEMENT ROUTES ===

// Create User (Protected by 'manage_users' permission)
router.post('/users',
  protect,
  authorize('admin', 'super_admin', 'volunteer'),
  checkPermission('manage_users'),
  adminController.createUser
);

// Search Users (for Camp Data Entry autocomplete) — must come BEFORE /users/:id routes
router.get('/users/search',
  protect,
  authorize('admin', 'super_admin', 'volunteer'),
  adminController.searchUsers
);

// Get All Users (Protected by 'manage_users' permission)
router.get('/users',
  protect,
  authorize('admin', 'super_admin', 'volunteer'),
  checkPermission('manage_users'),
  adminController.getAllUsers
);

// Delete User (Protected by 'manage_users')
router.delete('/users/:id',
  protect,
  authorize('admin', 'super_admin', 'volunteer'),
  checkPermission('manage_users'),
  adminController.deleteUser
);

// Update User Role
router.put('/users/:id/role',
  protect,
  authorize('admin', 'super_admin', 'volunteer'),
  checkPermission('manage_users'),
  adminController.updateUserRole
);

// Full User Edit
router.put('/users/:id',
  protect,
  authorize('admin', 'super_admin', 'volunteer'),
  checkPermission('manage_users'),
  adminController.updateUserFull
);

// Bulk Import Users
router.post('/users/import',
  protect,
  authorize('admin', 'super_admin', 'volunteer'),
  checkPermission('manage_users'),
  upload.single('file'),
  adminController.bulkImportUsers
);

// === SUPER ADMIN ROUTES ===
// These routes are strictly for Super Admins to manage other admins
router.get('/admins', protect, requireSuperAdmin, adminController.getAllAdmins);
router.put('/admins/:adminId/permissions', protect, requireSuperAdmin, adminController.updateAdminPermissions);

const settingsController = require('../controllers/settingsController');
router.get('/settings', protect, requireSuperAdmin, settingsController.getAllSettings);
router.put('/settings/:key', protect, requireSuperAdmin, settingsController.updateSetting);

// === DEPARTMENT MANAGEMENT ROUTES ===

// Create Department
router.post('/departments',
  protect,
  authorize('admin', 'super_admin', 'volunteer'),
  checkPermission('manage_batches'), // Using same permission for now
  departmentController.createDepartment
);

// Get All Departments
router.get('/departments',
  protect,
  authorize('admin', 'super_admin', 'volunteer'),
  checkPermission('manage_batches'),
  departmentController.getAllDepartments
);

// Assign Faculty to Department
router.put('/departments/:id/assign-faculty',
  protect,
  authorize('admin', 'super_admin', 'volunteer'),
  checkPermission('manage_batches'),
  departmentController.assignFacultyToDepartment
);

// === BATCH MANAGEMENT ROUTES ===

// Create Batch (Protected by 'manage_batches')
router.post('/batches',
  protect,
  authorize('admin', 'super_admin', 'volunteer'),
  checkPermission('manage_batches'),
  batchController.createBatch
);

// Get All Batches
router.get('/batches',
  protect,
  authorize('admin', 'super_admin', 'volunteer'),
  checkPermission('manage_batches'),
  batchController.getAllBatches
);

// Delete Batch
router.delete('/batches/:id',
  protect,
  authorize('admin', 'super_admin', 'volunteer'),
  checkPermission('manage_batches'),
  batchController.deleteBatch
);

// Assign Class Tutor to a Batch
router.put('/batches/:id/assign-tutor',
  protect,
  authorize('admin', 'super_admin', 'volunteer'),
  checkPermission('manage_batches'),
  batchController.assignClassTutor
);

// === EMAIL MANAGEMENT ROUTES ===

// Get All Emails
router.get('/emails',
  protect,
  authorize('admin', 'super_admin'),
  emailController.getAllEmails
);

// Schedule/Send Custom Email
router.post('/emails/schedule',
  protect,
  authorize('admin', 'super_admin'),
  emailController.scheduleEmail
);

// Cancel Scheduled Email
router.delete('/emails/:id',
  protect,
  authorize('admin', 'super_admin'),
  emailController.cancelScheduledEmail
);

// === PENDING CERTIFICATES REMINDERS ===

// Get Pending Reminders
router.get('/pending-reminders',
  protect,
  authorize('admin', 'super_admin'),
  adminController.getPendingReminders
);

// Send Pending Reminders
router.post('/pending-reminders/send',
  protect,
  authorize('admin', 'super_admin'),
  adminController.sendRemindersToFaculty
);

module.exports = router;