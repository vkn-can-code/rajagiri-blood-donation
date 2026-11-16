const { User, Batch, Donation, Department, sequelize } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const csv = require('csv-parser');
const bcrypt = require('bcryptjs');

// --- HELPER FUNCTION: Get Authorized Batches ---
// Returns an array of batches the user is authorized to manage.
// 1. If HoD, returns ALL batches in the department.
// 2. If Class Tutor, returns their assigned batch.
async function getAuthorizedBatches(userId) {
  // 1. Check if HoD
  const department = await Department.findOne({ where: { head_faculty_id: userId } });
  if (department) {
    const batches = await Batch.findAll({ where: { department_id: department.id } });
    // Attach department info for display usage if needed
    batches.forEach(b => b.setDataValue('Department', department));
    return batches;
  }

  // 2. Check if Class Tutor or assigned to batch in User profile
  const user = await User.findByPk(userId);
  const batchIds = new Set();
  
  if (user && user.batch_id) {
    batchIds.add(user.batch_id);
  }

  const tutoredBatches = await Batch.findAll({ where: { class_tutor_id: userId } });
  tutoredBatches.forEach(b => batchIds.add(b.id));

  if (batchIds.size > 0) {
    return await Batch.findAll({ where: { id: Array.from(batchIds) } });
  }

  return [];
}

// @desc    Get the faculty's assigned class and students
exports.getMyClass = async (req, res) => {
  try {
    // Pagination & Search Params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const selectedBatchId = req.query.batchId || 'all';
    const offset = (page - 1) * limit;

    const batches = await getAuthorizedBatches(req.user.id);

    if (batches.length === 0) {
      return res.status(200).json({ 
        batch: null, 
        allBatches: [],
        students: [], 
        pagination: { totalItems: 0, totalPages: 0, currentPage: 1, limit } 
      });
    }

    let targetBatchIds = batches.map(b => b.id);
    
    // Filter by specific batch if provided
    if (selectedBatchId !== 'all') {
      const parsedId = parseInt(selectedBatchId);
      if (targetBatchIds.includes(parsedId)) {
        targetBatchIds = [parsedId];
      }
    }

    // Build Search Query
    let whereClause = { batch_id: targetBatchIds, role: 'student' };
    if (search.trim() !== '') {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone_number: { [Op.like]: `%${search}%` } }
      ];
    }

    // Optimized Fetch with Count
    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'name', 'email', 'phone_number'],
      include: [{ model: Batch, as: 'StudentBatch', attributes: ['batch_name'] }],
      order: [['name', 'ASC']],
      limit: limit,
      offset: offset
    });

    // Current batch representation (used for metadata on the frontend)
    let displayBatch = batches[0];
    if (targetBatchIds.length > 1) {
      displayBatch = batches[0].toJSON();
      displayBatch.batch_name = `${batches[0].Department ? batches[0].Department.name : 'Department'} (All Batches)`;
      displayBatch.id = 'all';
    } else {
      displayBatch = batches.find(b => b.id === targetBatchIds[0]) || batches[0];
    }

    res.status(200).json({ 
      batch: displayBatch, 
      allBatches: batches,
      selectedBatchId: targetBatchIds.length > 1 ? 'all' : targetBatchIds[0],
      students: rows,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit: limit
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new student (Manual)
exports.addStudentToClass = async (req, res) => {
  try {
    const batches = await getAuthorizedBatches(req.user.id);
    if (batches.length === 0) throw new Error('No batches found to add student to.');

    const { name, email, phone_number, password, batch_id } = req.body;

    // Validate the requested batch_id belongs to this faculty
    const targetBatch = batches.find(b => b.id === parseInt(batch_id));
    if (!targetBatch) {
      return res.status(403).json({ message: 'Not authorized for this batch or invalid batch selected.' });
    }

    const newStudent = await User.create({
      name,
      email: email.toLowerCase(),
      phone_number,
      password_hash: password,
      role: 'student',
      batch_id: targetBatch.id
    });
    res.status(201).json({ message: `Student ${newStudent.name} added to ${targetBatch.batch_name}.`, student: newStudent });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Email or phone number already exists.' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// --- NEW: BULK IMPORT STUDENTS ---
exports.bulkImportStudents = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Please upload a CSV file' });
  const { batch_id } = req.body;

  try {
    const batches = await getAuthorizedBatches(req.user.id);
    if (batches.length === 0) throw new Error('No batches found to import to.');

    const targetBatch = batches.find(b => b.id === parseInt(batch_id));
    if (!targetBatch) {
       fs.unlinkSync(req.file.path);
       return res.status(403).json({ message: 'Not authorized for this batch or invalid batch selected.' });
    }

    const results = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          let successCount = 0;
          let failCount = 0;

          // Pre-hash default password for performance
          const salt = await bcrypt.genSalt(10);
          const defaultPasswordHash = await bcrypt.hash('123456', salt);

          for (const row of results) {
            // Validation: Ensure headers match
            if (!row.Name || !row.Email || !row.Phone) {
              failCount++;
              continue;
            }

            try {
              // Create user
              await User.create({
                name: row.Name,
                email: row.Email.toLowerCase(),
                phone_number: row.Phone,
                password_hash: defaultPasswordHash, // Default password
                role: 'student',
                batch_id: targetBatch.id,
                blood_group: row.BloodGroup || null
              });
              successCount++;
            } catch (err) {
              // Likely duplicate email/phone
              failCount++;
            }
          }

          // Clean up file
          fs.unlinkSync(req.file.path);

          res.json({
            message: `Import complete. Added: ${successCount}, Failed/Duplicate: ${failCount}.`
          });

        } catch (error) {
          res.status(500).json({ message: 'CSV Processing Error', error: error.message });
        }
      });

  } catch (error) {
    // If faculty has no batch
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Remove a student
exports.removeStudentFromClass = async (req, res) => {
  try {
    const batches = await getAuthorizedBatches(req.user.id);
    const batchIds = batches.map(b => b.id);

    const student = await User.findOne({
      where: { id: req.params.studentId, batch_id: batchIds }
    });
    if (!student) return res.status(404).json({ message: 'Student not found in your class(es).' });

    await student.destroy();
    res.status(200).json({ message: 'Student removed successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



// @desc    Get Pending Donations
exports.getPendingDonations = async (req, res) => {
  try {
    const batches = await getAuthorizedBatches(req.user.id);
    const batchIds = batches.map(b => b.id);

    const donations = await Donation.findAll({
      where: { status: 'pending' },
      include: {
        model: User,
        where: { batch_id: batchIds }, // Filter by authorized batches
        attributes: ['id', 'name', 'email']
      }
    });

    res.status(200).json(donations);
  } catch (error) {
    if (error.message.includes('not assigned')) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.approveDonation = async (req, res) => {
  try {
    const batches = await getAuthorizedBatches(req.user.id);
    const batchIds = batches.map(b => b.id);

    const donation = await Donation.findByPk(req.params.donationId, { include: User });
    if (!donation) return res.status(404).json({ message: 'Donation not found.' });

    // Check if donation belongs to one of the authorized batches
    if (!batchIds.includes(donation.User.batch_id)) {
      return res.status(403).json({ message: 'Not authorized for this student.' });
    }

    donation.status = 'approved';
    await donation.save();

    // --- RLYFE 2.0: Update User Stats & Send Appreciation ---
    const student = donation.User;
    student.has_donated = true;
    student.last_donation_date = donation.donation_date;
    await student.save();

    const mailer = require('../services/emailerService');
    try {
      if (mailer.sendAppreciationEmail) {
        await mailer.sendAppreciationEmail(student, donation);
      } else {
        console.warn('sendAppreciationEmail is not defined in mailer service');
      }
    } catch (mailError) {
      console.error('Failed to send appreciation email:', mailError);
    }
    // --------------------------------------------------------

    res.status(200).json({ message: 'Donation approved.', donation });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.rejectDonation = async (req, res) => {
  const { reason } = req.body;
  try {
    const batches = await getAuthorizedBatches(req.user.id);
    const batchIds = batches.map(b => b.id);

    const donation = await Donation.findByPk(req.params.donationId, { include: User });
    if (!donation) return res.status(404).json({ message: 'Donation not found.' });

    if (!batchIds.includes(donation.User.batch_id)) {
      return res.status(403).json({ message: 'Not authorized for this student.' });
    }

    donation.status = 'rejected';
    donation.rejection_reason = reason || 'No reason provided';
    await donation.save();
    res.status(200).json({ message: 'Donation rejected.', donation });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get willing donors (blood request responses) from faculty's class
exports.getWillingDonors = async (req, res) => {
  try {
    const batches = await getAuthorizedBatches(req.user.id);
    const batchIds = batches.map(b => b.id);

    const { RequestResponse, BloodRequest } = require('../models');

    const responses = await RequestResponse.findAll({
      include: [
        {
          model: User,
          where: { batch_id: batchIds },
          attributes: ['id', 'name', 'email', 'phone_number', 'blood_group']
        },
        {
          model: BloodRequest,
          attributes: ['id', 'patient_name', 'hospital_name', 'required_blood_group', 'status']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(responses);
  } catch (error) {
    if (error.message.includes('not assigned')) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};