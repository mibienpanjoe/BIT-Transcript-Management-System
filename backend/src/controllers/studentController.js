const Student = require('../models/Student');
const excelService = require('../services/excelService');

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin
exports.getStudents = async (req, res) => {
    try {
        const { field, promotion, year, search, fieldId, promotionId, academicYear } = req.query;
        let query = { isActive: true };

        if (field || fieldId) query.fieldId = field || fieldId;
        if (promotion || promotionId) query.promotionId = promotion || promotionId;
        if (year || academicYear) query.academicYear = year || academicYear;

        if (search) {
            const trimmedSearch = search.trim();

            // Check if search looks like a student ID (alphanumeric, no spaces)
            const isLikelyStudentId = /^[a-zA-Z0-9]+$/.test(trimmedSearch);

            if (isLikelyStudentId) {
                // Prioritize exact or prefix match on studentId
                query.$or = [
                    { studentId: { $regex: `^${trimmedSearch}`, $options: 'i' } }, // Starts with
                    { firstName: { $regex: trimmedSearch, $options: 'i' } },
                    { lastName: { $regex: trimmedSearch, $options: 'i' } },
                ];
            } else {
                // For searches with spaces or special chars, focus on names
                query.$or = [
                    { firstName: { $regex: trimmedSearch, $options: 'i' } },
                    { lastName: { $regex: trimmedSearch, $options: 'i' } },
                    { studentId: { $regex: trimmedSearch, $options: 'i' } },
                ];
            }
        }

        const students = await Student.find(query)
            .populate('fieldId', 'name code')
            .populate('promotionId', 'name level')
            .sort({ studentId: 1 }); // Sort by studentId for consistent ordering

        res.status(200).json({
            success: true,
            count: students.length,
            data: students,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get students by promotion
// @route   GET /api/students/promotion/:promotionId
// @access  Private/Admin
exports.getStudentsByPromotion = async (req, res) => {
    try {
        const students = await Student.find({
            promotionId: req.params.promotionId,
            isActive: true
        })
            .populate('fieldId', 'name code')
            .populate('promotionId', 'name level')
            .sort({ studentId: 1 });

        res.status(200).json({
            success: true,
            count: students.length,
            data: students,
        });
    } catch (err) {
        console.error('Error fetching students by promotion:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch students for this promotion'
        });
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
