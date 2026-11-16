import api from './api';

// Get all notifications for the logged-in user
export const getMyNotifications = async () => {
  try {
    const response = await api.get('/notifications');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
  }
};

// Mark a specific notification as read
export const markAsRead = async (id) => {
  try {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to mark as read');
  }
};