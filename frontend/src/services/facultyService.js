import api from './api';

// ... (Existing functions: getMyClass, getPendingDonations, approve, reject, remove, promote)

export const getMyClass = async (page = 1, limit = 10, search = '', batchId = 'all') => {
  const res = await api.get(`/faculty_admin/my-class?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&batchId=${batchId}`);
  return res.data;
};

export const addStudentToClass = async (studentData) => {
  const res = await api.post('/faculty_admin/my-class/students', studentData);
  return res.data;
};

export const removeStudentFromClass = async (studentId) => {
  const res = await api.delete(`/faculty_admin/my-class/students/${studentId}`);
  return res.data;
};



export const getPendingDonations = async () => {
  const res = await api.get('/faculty_admin/my-class/pending-donations');
  return res.data;
};

export const approveDonation = async (id) => {
  const res = await api.post(`/faculty_admin/donations/${id}/approve`);
  return res.data;
};

export const rejectDonation = async (id) => {
  const res = await api.post(`/faculty_admin/donations/${id}/reject`);
  return res.data;
};

// --- NEW FUNCTION ---
export const importStudents = async (formData) => {
  try {
    const response = await api.post('/faculty_admin/my-class/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Import failed');
  }
};

export const getWillingDonors = async () => {
  const res = await api.get('/faculty_admin/my-class/willing-donors');
  return res.data;
};
