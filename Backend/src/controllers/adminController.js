const { User, Batch, Department, Donation } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const csv = require('csv-parser');
// removed bcrypt import - let the model handle hashing

// === 1. CREATE USER (Manual) ===
exports.createUser = async (req, res) => {
  const { name, email, phone_number, password, role, batch_id, blood_group } = req.body;

  // Validation
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Please provide Name, Email, Password, and Role.' });
  }

  const isAdminRole = role === 'admin' || role === 'super_admin';
  if (!isAdminRole && !phone_number) {
    return res.status(400).json({ message: 'Phone number is required for this role.' });
  }

  try {
    const userData = {
      name,
      email: email.toLowerCase(),
      phone_number: phone_number || null,
      password_hash: password, // FIX: Send PLAIN text. Model hook will hash it.
      role,
      blood_group: blood_group || null
    };

    if (role === 'student' && batch_id) {
      userData.batch_id = parseInt(batch_id, 10);
    }

    const newUser = await User.create(userData);
    res.status(201).json({ message: `User ${newUser.name} created successfully` });

  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Email or phone number already exists.' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// === 2. FULL USER EDIT ===
exports.updateUserFull = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone_number, role, batch_id, password, blood_group } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update basic fields
    user.name = name || user.name;
    user.email = email || user.email;
    if (phone_number !== undefined) user.phone_number = phone_number || null;
    user.role = role || user.role;
    user.blood_group = blood_group || user.blood_group;
    if (batch_id !== undefined) user.batch_id = batch_id || null;

    // FIX: Update Password ONLY if provided. 
    // Pass PLAIN text. The 'beforeUpdate' hook in the model will hash it.
    if (password && password.trim() !== "") {
      user.password_hash = password;
    }

    await user.save();
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

// === 3. BULK IMPORT USERS ===
exports.bulkImportUsers = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Please upload a CSV file' });

  const results = [];
  const { defaultRole, defaultBatchId } = req.body;

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        let successCount = 0;
        let failCount = 0;

        for (const row of results) {
          // Validation
          if (!row.Name || !row.Email) {
            failCount++;
            continue;
          }

          const isImportAdmin = defaultRole === 'admin' || defaultRole === 'super_admin';
          if (!isImportAdmin && !row.Phone) {
            failCount++;
            continue;
          }

          try {
            // FIX: Pass PLAIN text password. The 'beforeCreate' hook will hash it.
            const plainPassword = row.Password || '123456';

            await User.create({
              name: row.Name,
              email: row.Email.toLowerCase(),
              phone_number: row.Phone || null,
              blood_group: row.BloodGroup || null,
              password_hash: plainPassword, // Plain text sent to model
              role: defaultRole || 'student',
              batch_id: defaultBatchId || null
            });
            successCount++;
          } catch (err) {
            failCount++;
          }
        }

        fs.unlinkSync(req.file.path);

        res.json({
          message: `Import complete. Success: ${successCount}, Failed: ${failCount}.`
        });

      } catch (error) {
        res.status(500).json({ message: 'CSV Processing Error', error: error.message });
      }
    });
};

// ... (Keep existing getters and deletes) ...
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'phone_number', 'role', 'blood_group'],
      include: [
        {
          model: Batch,
          as: 'StudentBatch',
          attributes: ['id', 'batch_name'],
          include: {
            model: Department,
            as: 'Department',
            attributes: ['id', 'name']
          }
        },
        {
          model: Department,
          as: 'HeadedDepartments',
          attributes: ['id', 'name']
        }
      ]
    });
    res.status(200).json(users);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getAllUsers:", error); // Added detailed logging
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.destroy();
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', detail: error.message });
  }
};

// === SEARCH USERS (for Camp Data Entry autocomplete) ===
exports.searchUsers = async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return res.status(400).json({ message: 'Query must be at least 2 characters.' });
  }

  try {
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } },
          { phone_number: { [Op.like]: `%${q}%` } }
        ]
      },
      attributes: ['id', 'name', 'email', 'phone_number', 'blood_group', 'role', 'has_donated', 'last_donation_date'],
      limit: 10,
      order: [['name', 'ASC']]
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Search Users Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByPk(req.params.id);
    if (user) {
      user.role = role;
      await user.save();
      res.status(200).json({ message: 'User role updated successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await User.findAll({
      where: { role: 'admin' },
      attributes: ['id', 'name', 'email', 'permissions']
    });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateAdminPermissions = async (req, res) => {
  const { adminId } = req.params;
  const { permissions } = req.body;
  try {
    const admin = await User.findByPk(adminId);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    admin.permissions = permissions;
    await admin.save();
    res.json({ message: 'Permissions updated', admin });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// === PENDING CERTIFICATES REMINDERS ===

exports.getPendingReminders = async (req, res) => {
  try {
    const pendingDonations = await Donation.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'batch_id'],
          include: [
            {
              model: Batch,
              as: 'StudentBatch',
              attributes: ['id', 'batch_name', 'class_tutor_id'],
              include: [
                {
                  model: Department,
                  as: 'Department',
                  attributes: ['id', 'name', 'head_faculty_id']
                }
              ]
            }
          ]
        }
      ]
    });

    // Group by Faculty Admin
    const facultyMap = new Map();

    for (const donation of pendingDonations) {
      if (!donation.User || !donation.User.StudentBatch) continue;
      
      const batch = donation.User.StudentBatch;
      const dept = batch.Department;
      
      // Determine responsible faculty (Tutor first, then HoD)
      let responsibleFacultyId = batch.class_tutor_id;
      if (!responsibleFacultyId && dept) {
        responsibleFacultyId = dept.head_faculty_id;
      }
      
      if (!responsibleFacultyId) continue; // No assigned faculty
      
      if (!facultyMap.has(responsibleFacultyId)) {
        // We need the faculty user details. We will fetch them later.
        facultyMap.set(responsibleFacultyId, {
          facultyId: responsibleFacultyId,
          departmentName: dept ? dept.name : 'Unknown',
          batchName: batch.batch_name,
          pendingDonations: [],
          facultyDetails: null
        });
      }
      
      facultyMap.get(responsibleFacultyId).pendingDonations.push({
        donationId: donation.id,
        studentName: donation.User.name,
        date: donation.donation_date
      });
    }

    // Fetch details for all unique faculty IDs
    const facultyIds = Array.from(facultyMap.keys());
    if (facultyIds.length > 0) {
      const faculties = await User.findAll({
        where: { id: facultyIds },
        attributes: ['id', 'name', 'email']
      });
      
      faculties.forEach(f => {
        if (facultyMap.has(f.id)) {
          facultyMap.get(f.id).facultyDetails = {
            name: f.name,
            email: f.email
          };
        }
      });
    }

    // Convert map to array
    const remindersList = Array.from(facultyMap.values()).filter(f => f.facultyDetails !== null);
    
    res.status(200).json(remindersList);
  } catch (error) {
    console.error("Error fetching pending reminders:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const tutorEmails = require('../services/mailer/tutorEmails');

exports.sendRemindersToFaculty = async (req, res) => {
  const { reminders } = req.body; // Expects array of faculty reminder objects
  
  if (!reminders || !Array.isArray(reminders)) {
    return res.status(400).json({ message: 'Invalid payload. Expected an array of reminders.' });
  }

  let successCount = 0;
  let failCount = 0;

  for (const reminder of reminders) {
    try {
      const tutor = {
        name: reminder.facultyDetails.name,
        email: reminder.facultyDetails.email
      };
      const pendingCount = reminder.pendingDonations.length;
      const studentsList = reminder.pendingDonations.map(d => ({
        name: d.studentName,
        date: d.date
      }));
      
      await tutorEmails.sendPendingDonationsReminderEmail(tutor, pendingCount, studentsList);
      successCount++;
    } catch (error) {
      console.error(`Failed to send reminder to ${reminder.facultyDetails?.email}`, error);
      failCount++;
    }
  }

  res.status(200).json({ 
    message: `Reminders sent! Success: ${successCount}, Failed: ${failCount}` 
  });
};