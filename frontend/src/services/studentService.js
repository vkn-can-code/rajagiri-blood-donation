import api from './api';

/**
 * Fetches the logged-in user's donation history.
 * Calls: GET /api/donations/me
 */
export const getMyDonations = async () => {
  try {
    const response = await api.get('/donations/me');
    return response.data;
  } catch (error) {
    console.error("Error fetching my donations:", error);
    throw error.response?.data?.message || 'Error fetching donation history';
  }
};

/**
 * Uploads a new donation certificate.
 * Calls: POST /api/donations
 * @param {FormData} formData - Must contain 'donation_date' and 'certificate' (file)
 */
export const uploadDonation = async (formData) => {
  try {
    // We send FormData, so we must set the Content-Type header
    const response = await api.post('/donations', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading donation:", error);
    throw error.response?.data?.message || 'Error uploading certificate';
  }
};