// This file is src/services/volunteerService.js
// It handles all API calls for the 'volunteer' role.

import api from './api'; // Import the central Axios instance

/**
 * Gets all "new" responses to blood requests.
 * Calls: GET /api/volunteer/responses
 */
export const getNewResponses = async () => {
  try {
    const response = await api.get('/volunteer/responses');
    // The controller returns the data directly
    return response.data;
  } catch (error) {
    // Throw a specific error message from the backend if it exists
    throw new Error(error.response?.data?.message || 'Error fetching new responses');
  }
};

/**
 * Marks a specific response as "contacted".
 * Calls: PATCH /api/volunteer/responses/:responseId/contacted
 */
export const markResponseAsContacted = async (responseId) => {
  try {
    const response = await api.patch(`/volunteer/responses/${responseId}/contacted`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error marking response as contacted');
  }
};