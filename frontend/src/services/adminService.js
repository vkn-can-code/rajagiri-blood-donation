// --- UPDATED with new Camp Management functions ---

import api from './api';

// === User Management (from adminController.js) ===

/**
 * Gets a list of all users.
 * GET /api/admin/users
 */
export const getAllUsers = async () => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching users');
  }
};

/**
 * Creates a new user (student, faculty, etc.).
 * POST /api/admin/users
 */
export const createUser = async (userData) => {
  try {
    const response = await api.post('/admin/users', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error creating user');
  }
};

/**
 * Updates a specific user's role.
 * PUT /api/admin/users/:id/role
 */
export const updateUserRole = async (userId, role) => {
  try {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error updating role');
  }
};

/**
 * Deletes a user.
 * DELETE /api/admin/users/:id
 */
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error deleting user');
  }
};


// === Batch Management (from batchController.js) ===

/**
 * Gets a list of all batches and their assigned tutors.
 * GET /api/admin/batches
 */
export const getAllBatches = async () => {
  try {
    const response = await api.get('/admin/batches');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching batches');
  }
};

/**
 * Creates a new batch.
 * POST /api/admin/batches
 */
export const createBatch = async (batchData) => {
  try {
    const response = await api.post('/admin/batches', batchData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error creating batch');
  }
};

/**
 * Assigns a faculty member (tutor) to a batch.
 * PUT /api/admin/batches/:batchId/assign-tutor
 */
export const assignClassTutor = async (batchId, facultyId) => {
  try {
    const response = await api.put(`/admin/batches/${batchId}/assign-tutor`, { facultyId });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error assigning tutor');
  }
};


// === Blood Request Management (from bloodRequestController.js) ===

/**
 * Creates a new blood request.
 * POST /api/requests
 */
export const createBloodRequest = async (requestData) => {
  try {
    const response = await api.post('/requests', requestData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error creating request');
  }
};

/**
 * Updates an existing blood request's details.
 * PUT /api/requests/:requestId
 */
export const updateBloodRequest = async (requestId, requestData) => {
  try {
    const response = await api.put(`/requests/${requestId}`, requestData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error updating request');
  }
};

/**
 * Updates the status of a blood request (open, fulfilled, closed).
 * PATCH /api/requests/:requestId/status
 */
export const updateRequestStatus = async (requestId, status) => {
  try {
    const response = await api.patch(`/requests/${requestId}/status`, { status });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error updating status');
  }
};

/**
 * Deletes a blood request.
 * DELETE /api/requests/:requestId
 */
/**
 * Deletes a blood request.
 * DELETE /api/requests/:requestId
 */
export const deleteBloodRequest = async (requestId) => {
  try {
    const response = await api.delete(`/requests/${requestId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error deleting request');
  }
};

/**
 * Gets all requests (Admin/Faculty View) with Response details.
 * GET /api/requests/admin/all
 */
export const getAllRequestsAdmin = async () => {
  try {
    const response = await api.get('/requests/admin/all');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching requests');
  }
};

/**
 * Grants a certificate to a volunteer response.
 * PATCH /api/requests/response/:responseId/grant-certificate
 */
export const grantCertificate = async (responseId) => {
  try {
    const response = await api.patch(`/requests/response/${responseId}/grant-certificate`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error granting certificate');
  }
};


// === Camp Management (from campController.js) ===

/**
 * Creates a new donation camp.
 * POST /api/camps
 */
export const createCamp = async (campData) => {
  try {
    const response = await api.post('/camps', campData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error creating camp');
  }
};

/**
 * Deletes a specific camp.
 * DELETE /api/camps/:id
 */
export const deleteCamp = async (campId) => {
  try {
    const response = await api.delete(`/camps/${campId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error deleting camp');
  }
};

/**
 * Gets all registrations for a specific camp.
 * GET /api/camps/:id/registrations
 */
export const getCampRegistrations = async (campId) => {
  try {
    const response = await api.get(`/camps/${campId}/registrations`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching registrations');
  }
};

/**
 * Approves or rejects a camp registration.
 * PUT /api/camps/:id/registrations/:regId/status
 */
export const updateRegistrationStatus = async (campId, regId, status) => {
  try {
    const response = await api.put(`/camps/${campId}/registrations/${regId}/status`, { status });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error updating registration status');
  }
};

// --- !! NEW FUNCTIONS TO FIX ERROR !! ---

/**
 * Gets details for a single camp.
 * GET /api/camps/:id
 */
export const getCampById = async (campId) => {
  try {
    const response = await api.get(`/camps/${campId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching camp details');
  }
};

/**
 * Gets all donations (participants) for a single camp.
 * GET /api/camps/:id/donations
 */
export const getCampDonations = async (campId) => {
  try {
    const response = await api.get(`/camps/${campId}/donations`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching camp participants');
  }
};

/**
 * Updates a specific camp's details.
 * PUT /api/camps/:id
 */
export const updateCamp = async (campId, campData) => {
  try {
    const response = await api.put(`/camps/${campId}`, campData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error updating camp');
  }
};

// === System Settings Management ===

/**
 * Gets all system settings.
 * GET /api/admin/settings
 */
export const getSystemSettings = async () => {
  try {
    const response = await api.get('/admin/settings');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching system settings');
  }
};

/**
 * Updates a specific system setting.
 * PUT /api/admin/settings/:key
 */
export const updateSystemSetting = async (key, value, type = 'string') => {
  try {
    const response = await api.put(`/admin/settings/${key}`, { value, type });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error updating system setting');
  }
};

// === Camp Data Entry ===

/**
 * Search users by name, email, or phone number (for autocomplete).
 * GET /api/admin/users/search?q=<query>
 */
export const searchUsers = async (query) => {
  try {
    const response = await api.get(`/admin/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error searching users');
  }
};

/**
 * Record a blood donation at a camp (admin data entry).
 * POST /api/camps/:campId/data-entry
 */
export const recordCampDonation = async (campId, data) => {
  try {
    const response = await api.post(`/camps/${campId}/data-entry`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error recording donation');
  }
};

// === User Analytics ===

/**
 * Get complete analytics for a specific user.
 * GET /api/history/user/:userId
 */
export const getUserAnalytics = async (userId) => {
  try {
    const response = await api.get(`/history/user/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching user analytics');
  }
};