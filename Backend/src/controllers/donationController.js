const { Donation, User, Batch } = require('../models');
const { sendTutorNewDonationEmail } = require('../services/emailerService');

// @desc    A user uploads their own donation certificate
exports.createDonation = async (req, res) => {
  // --- UPDATED: Get description & blood_request_id ---
  const { donation_date, description, blood_request_id } = req.body;
  const user_id = req.user.id;

  if (!donation_date) {
    return res.status(400).json({ message: 'Donation date is required.' });
  }
  if (!req.file) {
    return res.status(400).json({ message: 'Certificate file is required.' });
  }

  const certificate_url = `/uploads/${req.file.filename}`;

  try {
    const newDonation = await Donation.create({
      user_id,
      donation_date,
      certificate_url,
      status: 'pending',
      description: description || null,
      blood_request_id: blood_request_id || null // Link to request if provided
    });

    // Notify Tutor (logic remains same)
    if (req.user.role === 'student') {
      const student = await User.findByPk(user_id, {
        include: {
          model: Batch,
          as: 'StudentBatch',
          include: { model: User, as: 'ClassTutor', attributes: ['email', 'name'] }
        }
      });

      if (student.StudentBatch && student.StudentBatch.ClassTutor && student.StudentBatch.ClassTutor.email) {
        await sendTutorNewDonationEmail(student.StudentBatch.ClassTutor, req.user, newDonation);
      }
    }

    // Send Appreciation Email to User (fire and forget)
    try {
      await sendAppreciationEmail(req.user, newDonation);
    } catch (err) {
      console.error("Failed to send appreciation email", err);
    }

    res.status(201).json({
      message: 'Donation uploaded and pending approval.',
      donation: newDonation
    });
  } catch (error) {
    console.error('Create Donation Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.findAll({
      where: { user_id: req.user.id },
      order: [['donation_date', 'DESC']]
    });
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};