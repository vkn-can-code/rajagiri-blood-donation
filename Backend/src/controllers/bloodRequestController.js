// src/controllers/bloodRequestController.js

// --- FIX: Merged all imports into one line to prevent SyntaxError ---
const { BloodRequest, User, RequestResponse, Batch, Notification } = require('../models');
const { Op } = require('sequelize');
const { sendNewRequestEmailToAll } = require('../services/emailerService');

// @desc    Admin creates a blood request
// @route   POST /api/requests
// @access  Admin, Super Admin
exports.createRequest = async (req, res) => {
  // Destructure all potential fields including the new hospital-grade ones
  const {
    patient_name,
    hospital_name,
    required_blood_group,
    units_required,
    patient_id,
    reason,
    bystander_name,
    bystander_number,
    required_date,
    google_maps_link
  } = req.body;

  const requester_id = req.user.id;

  try {
    const newRequest = await BloodRequest.create({
      requester_id,
      patient_name,
      hospital_name,
      required_blood_group,
      units_required,
      status: 'open',
      // Optional fields (default to null if not provided)
      patient_id: patient_id || null,
      patient_age: req.body.patient_age || null,
      reason: reason || null,
      bystander_name: bystander_name || null,
      bystander_number: bystander_number || null,
      required_date: required_date || new Date(),
      google_maps_link: google_maps_link || null
    });

    // Notify compatible users about the urgent need
    const eligibleDonorsMap = {
      'A+': ['A+', 'A-', 'O+', 'O-'],
      'A-': ['A-', 'O-'],
      'B+': ['B+', 'B-', 'O+', 'O-'],
      'B-': ['B-', 'O-'],
      'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      'AB-': ['A-', 'B-', 'AB-', 'O-'],
      'O+': ['O+', 'O-'],
      'O-': ['O-']
    };

    const compatibleBloodGroups = eligibleDonorsMap[required_blood_group] || [];

    if (compatibleBloodGroups.length > 0) {
      const compatibleUsers = await User.findAll({
        where: { blood_group: { [Op.in]: compatibleBloodGroups } },
        attributes: ['email']
      });

      if (compatibleUsers.length > 0) {
        await sendNewRequestEmailToAll(newRequest, compatibleUsers);
      }
    }

    res.status(201).json({ message: 'Blood request created and notifications sent', request: newRequest });
  } catch (error) {
    console.error("Create Request Error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Admin updates a request's details
// @route   PUT /api/requests/:requestId
// @access  Admin, Super Admin
exports.updateRequest = async (req, res) => {
  const { requestId } = req.params;
  const {
    patient_name, hospital_name, required_blood_group, units_required,
    patient_id, reason, bystander_name, bystander_number, required_date,
    google_maps_link
  } = req.body;

  try {
    const request = await BloodRequest.findByPk(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found.' });

    // Update core fields
    request.patient_name = patient_name || request.patient_name;
    request.hospital_name = hospital_name || request.hospital_name;
    request.required_blood_group = required_blood_group || request.required_blood_group;
    request.units_required = units_required || request.units_required;

    // Update new fields if provided
    if (patient_id !== undefined) request.patient_id = patient_id;
    if (req.body.patient_age !== undefined) request.patient_age = req.body.patient_age;
    if (reason !== undefined) request.reason = reason;
    if (bystander_name !== undefined) request.bystander_name = bystander_name;
    if (bystander_number !== undefined) request.bystander_number = bystander_number;
    if (required_date !== undefined) request.required_date = required_date;
    if (google_maps_link !== undefined) request.google_maps_link = google_maps_link;

    await request.save();
    res.status(200).json({ message: 'Request updated', request });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Admin updates a request's status
// @route   PATCH /api/requests/:requestId/status
// @access  Admin, Super Admin
exports.updateRequestStatus = async (req, res) => {
  const { status } = req.body;
  const { requestId } = req.params;
  try {
    const request = await BloodRequest.findByPk(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }
    request.status = status;
    await request.save();
    res.status(200).json({ message: `Request status updated to ${status}`, request });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Admin deletes a request
// @route   DELETE /api/requests/:requestId
// @access  Admin, Super Admin
exports.deleteRequest = async (req, res) => {
  const { requestId } = req.params;
  try {
    const request = await BloodRequest.findByPk(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found.' });

    await request.destroy();
    res.status(200).json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    A logged-in user responds to a request
// @route   POST /api/requests/:requestId/respond
// @access  Private (all roles)
// @desc    A logged-in user responds to a request
// @route   POST /api/requests/:requestId/respond
// @access  Private (all roles)
exports.respondToRequest = async (req, res) => {
  const { requestId } = req.params;
  const responder_id = req.user.id;
  const { message } = req.body;

  try {
    // 1. Fetch Request & Count Responses
    const request = await BloodRequest.findOne({
      where: { id: requestId, status: 'open' },
      include: [{ model: RequestResponse }]
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found or is no longer open.' });
    }

    // 2. CHECK COMPATIBILITY: Restrict users to only donate compatible blood groups
    if (!req.user.blood_group) {
        return res.status(400).json({ message: 'Please update your blood group in your profile before volunteering.' });
    }

    const donorBg = req.user.blood_group;
    const patientBg = request.required_blood_group;

    const compatibility = {
      'A+': ['A+', 'AB+'],
      'A-': ['A-', 'A+', 'AB-', 'AB+'],
      'B+': ['B+', 'AB+'],
      'B-': ['B-', 'B+', 'AB-', 'AB+'],
      'AB+': ['AB+'],
      'AB-': ['AB-', 'AB+'],
      'O+': ['O+', 'A+', 'B+', 'AB+'],
      'O-': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    };

    if (!compatibility[donorBg] || !compatibility[donorBg].includes(patientBg)) {
        const rejectReason = `Incompatible blood group (Donor: ${donorBg})`;
        await RequestResponse.create({
          request_id: requestId,
          responder_id: responder_id,
          message: message || null,
          contact_details: req.user.phone_number || 'Not Provided',
          status: 'rejected',
          reason: rejectReason
        });
        return res.status(400).json({ message: `Your blood group (${donorBg}) is not compatible with the requested blood group (${patientBg}).` });
    }

    // 3. CHECK LOGIC: Allow up to 3 volunteers per required unit
    const validResponses = request.RequestResponses || [];
    if (validResponses.length >= request.units_required * 3) {
      await RequestResponse.create({
        request_id: requestId,
        responder_id: responder_id,
        message: message || null,
        contact_details: req.user.phone_number || 'Not Provided',
        status: 'rejected',
        reason: 'Maximum volunteers reached'
      });
      return res.status(400).json({
        message: 'Thank you, but we have already received enough volunteers for this request.'
      });
    }

    // 4. Create Response
    const newResponse = await RequestResponse.create({
      request_id: requestId,
      responder_id: responder_id,
      message: message || null,
      contact_details: req.user.phone_number || 'Not Provided',
      status: 'accepted',
      reason: 'Eligible'
    });

    console.log(`✅ Response created for Request ${requestId} by User ${responder_id}`);

    // --- NON-BLOCKING NOTIFICATIONS ---
    // We wrap this in a separate try-catch so that if notifications fail,
    // the user still gets a success response.
    try {
      const mailer = require('../services/emailerService');

      // 5. Create Notification for Responder
      await Notification.create({
        user_id: responder_id,
        message: `You successfully volunteered for ${request.patient_name}. A volunteer will contact you shortly.`,
        type: 'success'
      });

      // 6. Send Volunteer Confirmation Email (To Student)
      if (mailer.sendVolunteerResponseEmail) {
        await mailer.sendVolunteerResponseEmail(req.user, request);
      }

      // 7. Notify Tutor (If student) & Internal Notifications (Admin/HOD)
      // We need to fetch the student with associations to find Tutor/Department
      const student = await User.findByPk(responder_id, {
        include: {
          model: Batch,
          as: 'StudentBatch',
          include: [
            { model: User, as: 'ClassTutor' },
            // Fix: Use correct model import if needed, but the previous one was requiring inline
            { model: require('../models').Department, as: 'Department' }
          ]
        }
      });

      // Notify Tutor
      if (student && student.StudentBatch && student.StudentBatch.ClassTutor) {
        await Notification.create({
          user_id: student.StudentBatch.ClassTutor.id,
          message: `Student ${student.name} has volunteered for a blood request (Patient: ${request.patient_name}).`,
          type: 'info'
        });

        if (mailer.sendVolunteerNotificationToTutor) {
          await mailer.sendVolunteerNotificationToTutor(student.StudentBatch.ClassTutor, student, request);
        }
      }

      // Notify Admins & Super Admins
      const { Op } = require('sequelize');
      const admins = await User.findAll({
        where: { role: { [Op.or]: ['admin', 'super_admin'] } },
        attributes: ['email']
      });

      if (admins.length > 0) {
        const adminEmails = admins.map(a => a.email);
        if (mailer.sendVolunteerNotificationToAdmin) {
          // We use 'student' here if available, otherwise req.user, 
          // but 'student' object has better info (Batch name etc)
          const volunteerObj = student || req.user;
          await mailer.sendVolunteerNotificationToAdmin(adminEmails, volunteerObj, request);
        }
      }

      // Notify Dept Head
      if (student && student.StudentBatch && student.StudentBatch.Department) {
        // Fetch full department with HeadFaculty
        const department = await require('../models').Department.findByPk(
          student.StudentBatch.Department.id,
          { include: { model: User, as: 'HeadFaculty' } }
        );

        if (department && department.HeadFaculty && mailer.sendVolunteerNotificationToDeptHead) {
          await mailer.sendVolunteerNotificationToDeptHead(
            department.HeadFaculty.email,
            student,
            request
          );
        }
      }

    } catch (notificationError) {
      // Log but do NOT fail the request
      console.error("⚠️ Notification/Email Partial Failure:", notificationError);
    }

    res.status(201).json({ message: 'Your response has been recorded.', response: newResponse });

  } catch (error) {
    console.error("Respond Error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all requests (Admin/Faculty View) with Response details
// @route   GET /api/requests/admin/all
// @access  Admin, Faculty
exports.getAllRequestsAdmin = async (req, res) => {
  try {
    const requests = await BloodRequest.findAll({
      include: [
        {
          model: RequestResponse,
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'email', 'phone_number', 'role'], // Responder details
              include: [
                {
                  model: Batch,
                  as: 'StudentBatch',
                  attributes: ['batch_name'],
                  include: {
                    model: require('../models').Department,
                    as: 'Department',
                    attributes: ['name']
                  }
                }
              ]
            }
          ]
        },
        { model: User, as: 'Requester', attributes: ['name', 'email'] } // Who created the request
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(requests);
  } catch (error) {
    console.error("Get All Requests Error:", error);
    res.status(500).json({ message: 'Server error fetching requests' });
  }
};

// @desc    Grant certificate to a student response
// @route   PATCH /api/requests/response/:responseId/grant-certificate
// @access  Admin, Faculty
exports.grantCertificate = async (req, res) => {
  const { responseId } = req.params;
  try {
    const response = await RequestResponse.findByPk(responseId);
    if (!response) return res.status(404).json({ message: 'Response not found' });

    response.certificate_status = 'granted';
    await response.save();

    res.status(200).json({ message: 'Certificate granted successfully', response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to grant certificate' });
  }
};

// @desc    Get all open requests (Public)
// @route   GET /api/requests
// @access  Public
exports.getAllOpenRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.findAll({
      where: { status: 'open' },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};