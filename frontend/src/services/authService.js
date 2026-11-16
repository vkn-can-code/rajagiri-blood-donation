import api from './api'; // Import the central Axios instance

/**
 * Logs in a user.
 * Calls: POST /api/auth/login
 * @param {object} credentials - { email, password }
 * @returns {object} - { message, token, user }
 */
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    // The controller returns { message, token, user }
    return response.data;
  } catch (error) {
    // Re-throw the error message from the backend
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

/**
 * Fetches the logged-in user's profile.
 * Calls: GET /api/users/me
 * @returns {object} - The user object
 */
export const getMyProfile = async () => {
  try {
    const response = await api.get('/users/me');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch profile');
  }
};

// --- NEW FUNCTION ---
/**
 * Registers a new user.
 * Calls: POST /api/auth/register
 * @param {object} userData - { name, email, phone_number, password }
 * @returns {object} - { message, token, user }
 */
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    // The controller returns { message, token, user }
    return response.data;
  } catch (error) {
    // Handle validation errors (e.g., "User already exists")
    if (error.response?.data?.errors) {
      // Return the first validation error
      throw new Error(error.response.data.errors[0].msg);
    }
    // Handle other errors (e.g., "User with this email already exists")
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

/**
 * Changes the user's password on first login.
 * Calls: POST /api/auth/change-password
 * @param {string} newPassword
 */
export const changePassword = async (newPassword) => {
  try {
    const response = await api.post('/auth/change-password', { newPassword });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to change password');
  }
};

/**
 * Sends a password reset email.
 * Calls: POST /api/auth/forgot-password
 */
export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to send reset email');
  }
};

/**
 * Resets the password using the token from the email link.
 * Calls: POST /api/auth/reset-password
 */
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to reset password');
  }
};

/**
 * Verifies if a reset token is valid and gets the user info.
 * Calls: GET /api/auth/verify-reset-token/:token
 */
export const verifyResetToken = async (token) => {
  try {
    const response = await api.get(`/auth/verify-reset-token/${token}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Invalid or expired token');
  }
};