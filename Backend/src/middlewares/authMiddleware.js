const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Middleware to protect routes (Authentication).
 * It verifies the JWT from the Authorization header, decodes it,
 * and attaches the full user object (including their role) from the database to the request object.
 * This makes the user's details available to all subsequent protected routes.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
exports.protect = async (req, res, next) => {
  let token;

  // Check if the request has an Authorization header and if it's a Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token from the header (e.g., "Bearer eyJhbGci...")
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using the secret key from our .env file
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // --- THE KEY CHANGE ---
      // Instead of just attaching the ID, we fetch the FULL user object from the database.
      // This makes their role and other details available to the next middleware (like 'authorize').
      // We exclude the password hash for security.
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password_hash'] }
      });

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found for this token' });
      }

      // If the user is found, proceed to the next middleware or the controller
      next();
    } catch (error) {
      console.error('TOKEN VERIFICATION ERROR:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    // If no token was found in the header at all
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * Middleware for Role-Based Access Control (Authorization).
 * This middleware should always be used AFTER the 'protect' middleware.
 * It checks if the logged-in user's role is included in the list of allowed roles.
 * @param {...string} roles - A list of allowed role strings (e.g., 'admin', 'volunteer', 'faculty').
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Check if the user object (attached by the 'protect' middleware) exists and has a role
    if (!req.user || !roles.includes(req.user.role)) {
      // If the user's role is not in the list of allowed roles, send a 403 Forbidden error.
      return res.status(403).json({ 
        message: `Forbidden: This action requires one of the following roles: ${roles.join(', ')}.` 
      });
    }
    // If the user's role is authorized, proceed to the next function
    next();
  };
};

exports.requireSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'super_admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access Denied: Super Admin privileges required.' });
  }
};

// --- NEW: Granular Permission Middleware ---
exports.checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    // 1. Super Admin is GOD MODE (Bypass all checks)
    if (req.user.role === 'super_admin') {
      return next();
    }

    // 2. Check the specific permission flag
    // We expect req.user.permissions to look like: { manage_users: true, ... }
    const userPermissions = req.user.permissions || {};
    
    // If the permission is explicitly set to false, deny access.
    // Note: If the permission is undefined, you might want to default to allowing or denying based on your policy.
    // Assuming default is allow if not explicitly blocked (as per your previous description "locking" implies blocking).
    // Or if you want to whitelist, check if (userPermissions[requiredPermission] === true).
    
    // Let's assume the permission object stores flags for ALLOWED actions based on your Sidebar logic:
    // const canManageUsers = isSuperAdmin || (isAdmin && user.permissions?.manage_users);
    
    if (userPermissions[requiredPermission] === true) {
      return next(); // Permission granted
    }

    // 3. Deny access
    return res.status(403).json({ 
      message: `Access Denied: You do not have the '${requiredPermission}' privilege.` 
    });
  };
};