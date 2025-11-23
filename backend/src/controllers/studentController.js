const Student = require('../models/Student');
const excelService = require('../services/excelService');

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin
exports.getStudents = async (req, res) => {
    try {
        const { field, promotion, year, search } = req.query;
        let query = { isActive: true };

        if (field) query.fieldId = field;
        if (promotion) query.promotionId = promotion;
        if (year) query.academicYear = year;

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { studentId: { $regex: search, $options: 'i' } },
            ];
        }

        const students = await Student.find(query)
            .populate('fieldId', 'name code')
            .populate('promotionId', 'name level');

        res.status(200).json({
            success: true,
            count: students.length,
            data: students,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private/Admin
exports.getStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate('fieldId', 'name code')
            .populate('promotionId', 'name level');

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.status(200).json({
            success: true,
            data: student,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Create student
// @route   POST /api/students
// @access  Private/Admin
exports.createStudent = async (req, res) => {
    try {
        const student = await Student.create(req.body);

        res.status(201).json({
            success: true,
            data: student,
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private/Admin
exports.updateStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.status(200).json({
            success: true,
            data: student,
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete student (Soft delete)
// @route   DELETE /api/students/:id
// @access  Private/Admin
exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.status(200).json({
            success: true,
            data: {},
            message: 'Student deactivated'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Import students from Excel
// @route   POST /api/students/import
// @access  Private/Admin
exports.importStudents = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const { fieldId, promotionId, academicYear } = req.body;

        if (!fieldId || !promotionId || !academicYear) {
            return res.status(400).json({ success: false, message: 'Please provide fieldId, promotionId, and academicYear' });
        }

        const data = await excelService.parseStudentExcel(req.file.buffer);
        const results = await excelService.validateAndImportStudents(data, fieldId, promotionId, academicYear);

        res.status(200).json({
            success: true,
            data: results,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
