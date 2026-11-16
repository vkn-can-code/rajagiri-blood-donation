const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const facultyAdminController = require('../controllers/facultyAdminController');
const upload = require('../middlewares/uploadMiddleware'); // Needed for CSV

// All routes in this file are for 'faculty_admin' only
router.use(protect, authorize('faculty_admin'));

// --- Class Management ---
router.get('/my-class', facultyAdminController.getMyClass);
router.post('/my-class/students', facultyAdminController.addStudentToClass);

// --- NEW: Bulk Import Route ---
router.post('/my-class/import', upload.single('file'), facultyAdminController.bulkImportStudents);

router.delete('/my-class/students/:studentId', facultyAdminController.removeStudentFromClass);

// --- Donation Approval ---
router.get('/my-class/pending-donations', facultyAdminController.getPendingDonations);
router.post('/donations/:donationId/approve', facultyAdminController.approveDonation);
router.post('/donations/:donationId/reject', facultyAdminController.rejectDonation);

// --- Willing Donors ---
router.get('/my-class/willing-donors', facultyAdminController.getWillingDonors);

module.exports = router;