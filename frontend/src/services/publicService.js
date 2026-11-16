// This file is src/services/publicService.js

import api from './api'; // Import the central Axios instance

/**
 * Fetches all "open" blood requests.
 */
export const getAllOpenRequests = async () => {
  try {
    const response = await api.get('/requests');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching open requests');
  }
};

/**
 * Fetches all upcoming blood donation camps (Paginated & Searchable).
 */
export const getAllCamps = async (page = 1, limit = 10, search = '') => {
  try {
    const response = await api.get('/camps', {
      params: { page, limit, search }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching camps');
  }
};

/**
 * --- NEW FUNCTION ---
 * Submits a response to a blood request.
 * POST /api/requests/:id/respond
 */
export const submitResponse = async (requestId, message) => {
  try {
    const response = await api.post(`/requests/${requestId}/respond`, { message });
    return response.data;
  } catch (error) {
    // Capture error message from backend
    const serverMessage = error.response?.data?.message;
    throw new Error(serverMessage || 'Failed to submit response');
  }
};