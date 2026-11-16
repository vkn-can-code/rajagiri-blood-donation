// src/middlewares/validationMiddleware.js
const { check, validationResult } = require('express-validator');

// This is our validation "chain" for the register route
exports.validateRegister = [
  check('name', 'Name is required')
    .not()
    .isEmpty(),

  check('email', 'Please include a valid email')
    .isEmail()
    .normalizeEmail(),

  // --- FIX ---
  // Changed 'phoneNumber' to 'phone_number' to match your User model
  check('phone_number', 'Phone number must be at least 10 digits')
    .isLength({ min: 10 }),
  // --- END FIX ---

  check('password', 'Password must be 6 or more characters')
    .isLength({ min: 6 })
];

// This function checks if any validation errors occurred
exports.runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // If there are errors, send a 400 Bad Request response with the errors
    return res.status(400).json({ errors: errors.array() });
  }
  // If there are no errors, call next() to proceed to the controller
  next();
};