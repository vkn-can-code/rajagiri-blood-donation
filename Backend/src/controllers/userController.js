const { User, Batch } = require('../models');

// @desc    Get the logged-in user's own profile
// @route   GET /api/users/me
// @access  Private (all roles)
exports.getMyProfile = async (req, res) => {
  try {
    // We fetch the user and include their Batch info if they are a student
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
      include: {
        model: Batch,
        as: 'StudentBatch', // This alias must match models/user.js
        attributes: ['id', 'batch_name']
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile (Self)
// @route   PUT /api/users/me
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fields allowed to be updated
    const {
      name,
      phone_number,
      blood_group,
      height,
      weight,
      gender,
      address,
      password
    } = req.body;

    // Update fields if provided
    if (name) user.name = name;
    if (phone_number) user.phone_number = phone_number;
    if (blood_group) user.blood_group = blood_group;
    if (height) user.height = height;
    if (weight) user.weight = weight;
    if (gender) user.gender = gender;
    if (address) user.address = address;

    // Password update (hashed by hook in model)
    if (password && password.trim() !== '') {
      user.password_hash = password;
    }

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        // ... return other fields as needed for frontend state update
        height: user.height,
        weight: user.weight
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};