const { RequestResponse, BloodRequest, User } = require('../models');

// @desc    Get all "new" responses to all blood requests
// @route   GET /api/volunteer/responses
// @access  Volunteer, Admin
exports.getNewResponses = async (req, res) => {
  try {
    const responses = await RequestResponse.findAll({
      where: { status: 'new' },
      order: [['createdAt', 'ASC']],
      include: [
        {
          model: User, // The User who responded
          attributes: ['id', 'name', 'email']
        },
        {
          model: BloodRequest, // The Request they responded to
          attributes: ['id', 'patient_name', 'hospital_name'],
          include: {
            model: User, // The Admin who created the request
            as: 'User', // This alias must match the model association
            attributes: ['id', 'name', 'phone_number'] // Admin's contact
          }
        }
      ]
    });
    res.status(200).json(responses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark a specific response as "contacted"
// @route   PATCH /api/volunteer/responses/:responseId/contacted
// @access  Volunteer, Admin
exports.markResponseAsContacted = async (req, res) => {
  const { responseId } = req.params;
  try {
    const response = await RequestResponse.findByPk(responseId);
    if (!response) {
      return res.status(404).json({ message: 'Response not found.' });
    }
    response.status = 'contacted';
    await response.save();
    res.status(200).json({ message: 'Response marked as contacted.', response });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};