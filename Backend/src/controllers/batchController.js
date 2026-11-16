const { Batch, User, Department } = require('../models');

// @desc    Admin creates a new batch
// @route   POST /api/admin/batches
// @access  Admin
exports.createBatch = async (req, res) => {
  // department_id is passed instead of string name
  const { batch_name, department_id } = req.body;

  if (!department_id) {
    return res.status(400).json({ message: 'Department is required' });
  }

  try {
    const batch = await Batch.create({
      batch_name,
      department_id
    });
    res.status(201).json({ message: 'Batch created successfully', batch });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Batch name already exists.' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Admin gets all batches
// @route   GET /api/admin/batches
// @access  Admin
exports.getAllBatches = async (req, res) => {
  try {
    const batches = await Batch.findAll({
      include: [
        {
          model: Department,
          as: 'Department',
          attributes: ['id', 'name'],
          include: {
            model: User,
            as: 'HeadFaculty',
            attributes: ['id', 'name']
          }
        },
        {
          model: User,
          as: 'Students',
          attributes: ['id']
        }
      ],
      order: [['batch_name', 'ASC']]
    });
    res.status(200).json(batches);
  } catch (error) {
    console.error("Error in getAllBatches:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Assign a faculty member as class tutor for a batch
// @route   PUT /api/admin/batches/:id/assign-tutor
// @access  Admin
exports.assignClassTutor = async (req, res) => {
  try {
    const batch = await Batch.findByPk(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const { facultyId } = req.body;

    // Allow unsetting tutor by passing null
    if (facultyId === null || facultyId === undefined) {
      batch.class_tutor_id = null;
      await batch.save();
      return res.status(200).json({ message: 'Class tutor removed.', batch });
    }

    // Validate the faculty exists and has an appropriate role
    const faculty = await User.findOne({
      where: { id: facultyId, role: ['faculty', 'faculty_admin'] }
    });
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty member not found or invalid role.' });
    }

    batch.class_tutor_id = facultyId;
    await batch.save();

    res.status(200).json({ message: `${faculty.name} assigned as class tutor for ${batch.batch_name}.`, batch });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a batch
// @route   DELETE /api/admin/batches/:id
// @access  Admin
exports.deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findByPk(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Optional: Check if students exist before deleting
    const studentCount = await User.count({ where: { batch_id: batch.id } });
    if (studentCount > 0) {
      return res.status(400).json({ message: `Cannot delete batch. It has ${studentCount} students.` });
    }

    await batch.destroy();
    res.status(200).json({ message: 'Batch deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
