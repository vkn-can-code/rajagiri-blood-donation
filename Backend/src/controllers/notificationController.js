const { Notification } = require('../models');

// @desc    Get all notifications for the logged-in user
// @route   GET /api/notifications
// @access  Private
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.is_read = true;
    await notification.save();
    res.status(200).json({ message: 'Marked as read', notification });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};