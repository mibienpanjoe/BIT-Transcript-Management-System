const calculationService = require('../services/calculationService');
const TUResult = require('../models/TUResult');
const SemesterResult = require('../models/SemesterResult');

// @desc    Calculate TU Average
// @route   POST /api/calculations/tu
// @access  Private/Admin
exports.calculateTU = async (req, res) => {
    try {
        const { studentId, tuId, academicYear } = req.body;

        const result = await calculationService.calculateTUAverage(studentId, tuId, academicYear);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Calculate Semester Average
// @route   POST /api/calculations/semester
// @access  Private/Admin
exports.calculateSemester = async (req, res) => {
    try {
        const { studentId, semesterId, academicYear } = req.body;

        const result = await calculationService.calculateSemesterAverage(studentId, semesterId, academicYear);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get TU Results
// @route   GET /api/calculations/tu-results
// @access  Private/Admin
exports.getTUResults = async (req, res) => {
    try {
        const { studentId, academicYear } = req.query;
        const results = await TUResult.find({ studentId, academicYear }).populate('tuId', 'name code');

        res.status(200).json({
            success: true,
            data: results
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get Semester Results
// @route   GET /api/calculations/semester-results
// @access  Private/Admin
exports.getSemesterResults = async (req, res) => {
    try {
        const { studentId, academicYear } = req.query;
        const results = await SemesterResult.find({ studentId, academicYear }).populate('semesterId', 'name');

        res.status(200).json({
            success: true,
            data: results
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
