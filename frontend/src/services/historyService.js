import api from './api';

// For Admins: Get ALL history
export const getAdminHistory = async () => {
  try {
    const response = await api.get('/history/admin');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching admin history');
  }
};

// For Faculty: Get Batch-Specific history
export const getFacultyHistory = async () => {
  try {
    const response = await api.get('/history/faculty/department-donations');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching faculty history');
  }
};