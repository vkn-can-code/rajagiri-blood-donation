const { Department, User, Batch } = require('../models');

// @desc    Get all departments
// @route   GET /api/admin/departments
exports.getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.findAll({
            include: [
                {
                    model: User,
                    as: 'HeadFaculty',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Batch,
                    as: 'Batches',
                    attributes: ['id', 'batch_name']
                }
            ]
        });
        res.status(200).json(departments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create a new department
// @route   POST /api/admin/departments
exports.createDepartment = async (req, res) => {
    const { name, head_faculty_id } = req.body;
    try {
        const newDept = await Department.create({
            name,
            head_faculty_id: head_faculty_id || null
        });
        res.status(201).json({ message: 'Department created!', department: newDept });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Assign faculty to department
// @route   PUT /api/admin/departments/:id/assign-faculty
exports.assignFacultyToDepartment = async (req, res) => {
    const { id } = req.params;
    const { facultyId } = req.body;
    try {
        const dept = await Department.findByPk(id);
        if (!dept) return res.status(404).json({ message: 'Department not found' });

        dept.head_faculty_id = facultyId;
        await dept.save();

        res.status(200).json({ message: 'Faculty assigned successfully', department: dept });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
