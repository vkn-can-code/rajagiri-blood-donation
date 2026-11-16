const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { sendPasswordResetEmail } = require('../services/mailer/userEmails');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  // 1. Basic Validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  try {
    // 2. Find User
    // Ensure email is lowercase to match how we saved it
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 3. Check Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 4. Generate Token
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Logged in successfully!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        is_first_login: user.is_first_login
      },
    });

  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// ... (Keep register function) ...
exports.register = async (req, res) => {
    // ... your existing register logic ...
    const { name, email, phone_number, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (user) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    user = await User.findOne({ where: { phone_number } });
    if (user) {
      return res.status(400).json({ message: 'User with this phone number already exists.' });
    }

    // Create new user. The 'beforeCreate' hook in user.js will hash the password.
    // New public registrations are automatically assigned the 'student' role.
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      phone_number,
      password_hash: password, // The hook will hash this
      role: 'student' // Default role for public registration
    });

    // Registration successful, now log them in by creating a token
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send the same response as the login route
    res.status(201).json({
      message: 'Registered successfully!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
    });

  } catch (err) {
    console.error('Register Error:', err);
    // Handle validation errors (like unique constraint)
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Email or phone number already exists.' });
    }
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

/**
 * POST /api/auth/change-password
 * Protected route — changes password and marks is_first_login = false.
 */
exports.changePassword = async (req, res) => {
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Setting password_hash triggers the beforeUpdate hook which will hash it
    user.password_hash = newPassword;
    user.is_first_login = false;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Change Password Error:', err);
    res.status(500).json({ message: 'Server error while changing password.' });
  }
};

/**
 * POST /api/auth/forgot-password
 * Public – generates a reset token and emails the link to the user.
 */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Please provide your email address.' });
  }

  try {
    const user = await User.findOne({ where: { email: email.toLowerCase() } });

    // Always respond with success to prevent email enumeration
    if (!user) {
      return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.reset_token = token;
    user.reset_token_expires = expires;
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    await sendPasswordResetEmail(user, resetLink);

    res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot Password Error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

/**
 * POST /api/auth/reset-password
 * Public – validates the token and sets the new password.
 */
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_token_expires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    user.password_hash = newPassword;
    user.reset_token = null;
    user.reset_token_expires = null;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset Password error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};

// @desc    Verify reset token and return user info
// @route   GET /api/auth/verify-reset-token/:token
// @access  Public
exports.verifyResetToken = async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_token_expires: { [Op.gt]: new Date() }
      },
      attributes: ['name', 'email']
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    res.json({ valid: true, user });
  } catch (error) {
    console.error('Verify Token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};