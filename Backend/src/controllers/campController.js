// src/controllers/campController.js

const { Camp, CampRegistration, User, Donation } = require('../models');
const userEmails = require('../services/mailer/userEmails');

// @desc    Create a new blood donation camp
// @route   POST /api/camps
// @access  Private (Admin & Volunteer)
exports.createCamp = async (req, res) => {
  // --- UPDATED ---
  const { title, location, address, camp_date, latitude, longitude, google_maps_link } = req.body;
  // --- END UPDATE ---

  if (!title || !location || !camp_date) {
    return res.status(400).json({ message: 'Title, location, and date are required.' });
  }

  try {
    const newCamp = await Camp.create({
      title,
      location,
      address,
      camp_date,
      // --- NEW ---
      latitude,
      longitude,
      google_maps_link
      // --- END NEW ---
    });

    // Notify all users about the new camp (in background so it doesn't block the request)
    userEmails.sendNewCampEmail(newCamp).catch(err => console.error("Failed to send camp email:", err));

    res.status(201).json({
      message: 'Camp created successfully!',
      camp: newCamp
    });

  } catch (error) {
    console.error("Create Camp Error:", error);
    res.status(500).json({ message: 'Server error while creating camp.' });
  }
};

// @desc    Get all upcoming blood donation camps
// @route   GET /api/camps
// @access  Public
exports.getAllCamps = async (req, res) => {
  try {
    const camps = await Camp.findAll({
      order: [['camp_date', 'ASC']] // Order camps by date, soonest first
    });
    res.status(200).json(camps);
  } catch (error) {
    console.error("Get All Camps Error:", error);
    res.status(500).json({ message: 'Server error while fetching camps.' });
  }
};

// --- NEW FUNCTION: GET A SINGLE CAMP ---
// @desc    Get details for a single camp
// @route   GET /api/camps/:id
// @access  Admin
exports.getCampById = async (req, res) => {
  try {
    const camp = await Camp.findByPk(req.params.id);
    if (!camp) {
      return res.status(404).json({ message: 'Camp not found.' });
    }
    res.status(200).json(camp);
  } catch (error) {
    console.error("Get Camp By ID Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};
// --- END NEW FUNCTION ---

// --- NEW FUNCTION: GET CAMP DONATIONS (PARTICIPANTS) ---
// @desc    Get all donations for a specific camp
// @route   GET /api/camps/:id/donations
// @access  Admin
exports.getCampDonations = async (req, res) => {
  try {
    const donations = await Donation.findAll({
      where: { camp_id: req.params.id },
      include: {
        model: User,
        attributes: ['id', 'name', 'email', 'phone_number', 'role'] // Get participant info
      },
      order: [['createdAt', 'ASC']]
    });
    res.status(200).json(donations);
  } catch (error) {
    console.error("Get Camp Donations Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};
// --- END NEW FUNCTION ---

// --- NEW FUNCTION: CAMP DATA ENTRY (Admin records an on-site donor) ---
// @desc    Admin/Volunteer records a blood donation that happened at a camp
// @route   POST /api/camps/:id/data-entry
// @access  Private (Admin, Super Admin, Volunteer)
exports.recordCampDonation = async (req, res) => {
  const { id: camp_id } = req.params;
  const { user_id, donation_date, blood_units, notes } = req.body;

  if (!user_id || !donation_date) {
    return res.status(400).json({ message: 'user_id and donation_date are required.' });
  }

  try {
    // 1. Validate camp exists
    const camp = await Camp.findByPk(camp_id);
    if (!camp) return res.status(404).json({ message: 'Camp not found.' });

    // 2. Validate donor exists
    const donor = await User.findByPk(user_id);
    if (!donor) return res.status(404).json({ message: 'User not found.' });

    // 3. Prevent duplicate entry: same user at same camp
    const existing = await Donation.findOne({ where: { user_id, camp_id } });
    if (existing) {
      return res.status(409).json({
        message: `${donor.name} has already been recorded as a donor for this camp.`
      });
    }

    // 4. Build description: include blood_units and optional notes
    const descParts = [`Camp: ${camp.title}`];
    if (blood_units) {
      const u = Number(blood_units);
      descParts.push(`Units: ${u} ${u === 1 ? 'unit' : 'units'}`);
    }
    if (notes) descParts.push(notes);
    const description = descParts.join(' | ');

    // 5. Create the donation record (auto-approved; admin is confirming in person)
    const donation = await Donation.create({
      user_id,
      camp_id,
      donation_date,
      certificate_url: 'camp_entry',
      status: 'approved',
      description
    });

    // 6. Update user's donation stats
    await donor.update({
      has_donated: true,
      last_donation_date: donation_date
    });

    // Return the donation with donor details
    const result = await Donation.findByPk(donation.id, {
      include: { model: User, attributes: ['id', 'name', 'email', 'phone_number', 'blood_group', 'role'] }
    });

    res.status(201).json({
      message: `Donation recorded successfully for ${donor.name}.`,
      donation: result
    });
  } catch (error) {
    console.error('Record Camp Donation Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// --- END NEW FUNCTION ---


// --- NEW FUNCTION: UPDATE A CAMP ---
// @desc    Update a camp's details
// @route   PUT /api/camps/:id
// @access  Admin
exports.updateCamp = async (req, res) => {
  const { id } = req.params;
  // Get all fields, including new coords
  const { title, location, address, camp_date, latitude, longitude, google_maps_link } = req.body;
  
  try {
    const camp = await Camp.findByPk(id);
    if (!camp) {
      return res.status(404).json({ message: 'Camp not found.' });
    }

    // Update all fields
    camp.title = title || camp.title;
    camp.location = location || camp.location;
    camp.address = address || camp.address;
    camp.camp_date = camp_date || camp.camp_date;
    camp.latitude = latitude || camp.latitude;
    camp.longitude = longitude || camp.longitude;
    if (google_maps_link !== undefined) camp.google_maps_link = google_maps_link;

    await camp.save();
    res.status(200).json({ message: 'Camp updated successfully.', camp });
  } catch (error) {
    console.error("Update Camp Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};
// --- END NEW FUNCTION ---

// @desc    Admin deletes a camp
// @route   DELETE /api/camps/:id
// @access  Admin
exports.deleteCamp = async (req, res) => {
  const { id } = req.params;
  try {
    const camp = await Camp.findByPk(id);
    if (!camp) {
      return res.status(404).json({ message: 'Camp not found.' });
    }

    await camp.destroy();
    res.status(200).json({ message: 'Camp deleted successfully.' });
  } catch (error) {
    console.error("Delete Camp Error:", error);
    res.status(500).json({ message: 'Server error while deleting camp.' });
  }
};

// --- CAMP REGISTRATIONS ---

exports.registerForCamp = async (req, res) => {
  const { id: camp_id } = req.params;
  const user_id = req.user.id;
  const {
    weight_over_45,
    already_donated,
    major_surgery,
    on_medication,
    tattoo_piercing,
    consumed_alcohol,
    dental_work,
    pregnant_breastfeeding,
    history_disease
  } = req.body;

  try {
    // Check if camp exists
    const camp = await Camp.findByPk(camp_id);
    if (!camp) return res.status(404).json({ message: 'Camp not found' });

    // Check if user already registered
    const existing = await CampRegistration.findOne({ where: { user_id, camp_id } });
    if (existing) return res.status(400).json({ message: 'You have already registered for this camp' });

    // Auto-rejection logic
    let status = 'pending';
    if (
      !weight_over_45 ||
      major_surgery ||
      on_medication ||
      tattoo_piercing ||
      consumed_alcohol ||
      dental_work ||
      pregnant_breastfeeding ||
      history_disease
    ) {
      status = 'auto_rejected';
    }

    const registration = await CampRegistration.create({
      user_id,
      camp_id,
      status,
      weight_over_45,
      already_donated,
      major_surgery,
      on_medication,
      tattoo_piercing,
      consumed_alcohol,
      dental_work,
      pregnant_breastfeeding,
      history_disease
    });

    res.status(201).json({ message: 'Registration successful', status: registration.status });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCampRegistrations = async (req, res) => {
  const { id: camp_id } = req.params;
  try {
    const registrations = await CampRegistration.findAll({
      where: { camp_id },
      include: [{ model: User, attributes: ['id', 'name', 'email', 'phone_number', 'role'] }],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(registrations);
  } catch (error) {
    console.error("Get Registrations Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateRegistrationStatus = async (req, res) => {
  const { id: camp_id, regId } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'

  try {
    const registration = await CampRegistration.findOne({
      where: { id: regId, camp_id },
      include: [User, Camp]
    });

    if (!registration) return res.status(404).json({ message: 'Registration not found' });

    registration.status = status;
    await registration.save();

    // If approved, send email
    if (status === 'approved' && registration.User && registration.Camp) {
      try {
        await userEmails.sendCampApprovalEmail(registration.User, registration.Camp);
      } catch (emailError) {
        console.error("Failed to send approval email:", emailError);
        // Continue, don't fail the API
      }
    }

    res.status(200).json({ message: 'Status updated successfully', registration });
  } catch (error) {
    console.error("Update Registration Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};