// src/controllers/historyController.js

const { BloodRequest, RequestResponse, Camp, Donation, User, Batch, Department, CampRegistration } = require('../models');
const { Op } = require('sequelize');


// --- HELPER: Get Faculty's Authorized Batch IDs ---
async function getAuthorizedBatchIds(userId) {
  // 1. Check if user is a Department Head (HoD)
  const department = await Department.findOne({
    where: { head_faculty_id: userId },
    include: [{ model: Batch, as: 'Batches' }] // Fetch all batches in this department
  });

  if (department && department.Batches.length > 0) {
    return department.Batches.map(b => b.id);
  }

  // 2. Check if user is a Class Tutor for specific batches
  const tutoredBatches = await Batch.findAll({ where: { class_tutor_id: userId } });
  const batchIds = new Set(tutoredBatches.map(b => b.id));

  // 3. Also check if the user record itself has a batch_id (faculty assigned to a batch directly)
  const user = await User.findByPk(userId);
  if (user && user.batch_id) {
    batchIds.add(user.batch_id);
  }

  if (batchIds.size > 0) {
    return Array.from(batchIds);
  }

  return [];
}

/**
 * @desc    Get Complete History for Admin (All Requests & Camps)
 * @route   GET /api/history/admin
 * @access  Admin, Super Admin
 */
exports.getAdminHistory = async (req, res) => {
  try {
    // 1. Fetch all Blood Requests with Responses
    const requestHistory = await BloodRequest.findAll({
      include: [{
        model: RequestResponse,
        include: [{
          model: User,
          attributes: ['id', 'name', 'email', 'phone_number', 'batch_id']
        }]
      }],
      order: [['createdAt', 'DESC']]
    });

    // 2. Fetch all Camps with Donations (Participants)
    const campHistory = await Camp.findAll({
      include: [{
        model: Donation,
        include: [{
          model: User,
          attributes: ['id', 'name', 'email', 'phone_number', 'batch_id']
        }]
      }],
      order: [['camp_date', 'DESC']]
    });

    res.status(200).json({
      requests: requestHistory,
      camps: campHistory
    });
  } catch (error) {
    console.error("Admin History Error:", error);
    res.status(500).json({ message: 'Server error fetching history' });
  }
};

/**
 * @desc    Get History for Faculty (Only their students)
 * @route   GET /api/history/faculty
 * @access  Faculty
 */
exports.getFacultyHistory = async (req, res) => {
  try {
    const batchIds = await getAuthorizedBatchIds(req.user.id);

    if (!batchIds || batchIds.length === 0) {
      return res.status(200).json({
        batch_ids: [],
        requests: [],
        camps: []
      });
    }

    // 1. Fetch Blood Requests where RESPONDERS are in these batches
    const requestHistory = await BloodRequest.findAll({
      include: [{
        model: RequestResponse,
        required: true, // Only fetch requests that HAVE responses from these batches
        include: [{
          model: User,
          where: { batch_id: { [Op.in]: batchIds } }, // <-- FILTER BY BATCH IDs
          attributes: ['id', 'name', 'email', 'phone_number']
        }]
      }],
      order: [['createdAt', 'DESC']]
    });

    // 2. Fetch Camps where DONORS are in these batches
    const campHistory = await Camp.findAll({
      include: [{
        model: Donation,
        required: true, // Only fetch camps that HAVE donations from these batches
        include: [{
          model: User,
          where: { batch_id: { [Op.in]: batchIds } }, // <-- FILTER BY BATCH IDs
          attributes: ['id', 'name', 'email', 'phone_number']
        }]
      }],
      order: [['camp_date', 'DESC']]
    });

    res.status(200).json({
      batch_ids: batchIds,
      requests: requestHistory,
      camps: campHistory
    });

  } catch (error) {
    console.error("Faculty History Error:", error);
    res.status(500).json({ message: 'Server error fetching history' });
  }
};

/**
 * @desc    Get complete analytics for a specific user
 * @route   GET /api/history/user/:userId
 * @access  Admin, Super Admin, Faculty Admin (own batch only)
 */
exports.getUserAnalytics = async (req, res) => {
  const { userId } = req.params;

  try {
    // 1. Fetch the target user's profile
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] },
      include: [
        { model: Batch, as: 'StudentBatch', attributes: ['id', 'batch_name'],
          include: [{ model: Department, as: 'Department', attributes: ['id', 'name'] }]
        }
      ]
    });

    if (!user) return res.status(404).json({ message: 'User not found.' });

    // 2. Faculty Admin guard — ensure target user is in their authorized batch
    if (req.user.role === 'faculty_admin') {
      const authorizedBatchIds = await getAuthorizedBatchIds(req.user.id);
      if (authorizedBatchIds.length === 0) {
        return res.status(403).json({ 
          message: 'Access denied: You are not assigned as a class tutor or department head. Please contact an administrator to assign you to a batch.' 
        });
      }
      if (!authorizedBatchIds.includes(user.batch_id)) {
        return res.status(403).json({ message: 'Access denied: This student is not in your assigned batch.' });
      }
    }

    // 3. Fetch all involvement in parallel
    const [donations, bloodRequests, requestResponses, campRegistrations] = await Promise.all([

      // Donations the user made
      Donation.findAll({
        where: { user_id: userId },
        include: [{ model: Camp, attributes: ['id', 'title', 'camp_date', 'location'] }],
        order: [['donation_date', 'DESC']]
      }),

      // Blood requests the user submitted
      BloodRequest.findAll({
        where: { requester_id: userId },
        order: [['createdAt', 'DESC']]
      }),

      // Request responses the user gave (when they helped someone else)
      RequestResponse.findAll({
        where: { responder_id: userId },
        include: [{
          model: BloodRequest,
          attributes: ['id', 'patient_name', 'hospital_name', 'required_blood_group', 'units_required', 'status', 'createdAt']
        }],
        order: [['createdAt', 'DESC']]
      }),

      // Camp registrations
      CampRegistration.findAll({
        where: { user_id: userId },
        include: [{ model: Camp, attributes: ['id', 'title', 'camp_date', 'location'] }],
        order: [['createdAt', 'DESC']]
      })
    ]);

    // 4. Compute summary stats
    const parseUnits = (description) => {
      if (!description) return 1;
      const match = description.match(/Units:\s*(\d+)\s*unit/i);
      return match ? parseInt(match[1]) : 1;
    };

    const approvedDonations = donations.filter(d => d.status === 'approved');

    const stats = {
      totalDonations:         donations.length,
      approvedDonations:      approvedDonations.length,
      rejectedDonations:      donations.filter(d => d.status === 'rejected').length,
      pendingDonations:       donations.filter(d => d.status === 'pending').length,
      totalBloodUnits:        approvedDonations.reduce((sum, d) => sum + parseUnits(d.description), 0),
      totalRequests:          bloodRequests.length,
      fulfilledRequests:      bloodRequests.filter(r => r.status === 'fulfilled').length,
      totalResponses:         requestResponses.length,
      acceptedResponses:      requestResponses.filter(r => r.status === 'accepted').length,
      campRegistrations:      campRegistrations.length,
      approvedRegistrations:  campRegistrations.filter(r => r.status === 'approved').length,
    };

    res.status(200).json({
      user,
      donations,
      bloodRequests,
      requestResponses,
      campRegistrations,
      stats
    });

  } catch (error) {
    console.error('Get User Analytics Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};