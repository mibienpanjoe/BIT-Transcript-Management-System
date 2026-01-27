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

// @desc    Calculate Annual Result
// @route   POST /api/calculations/annual
// @access  Private/Admin
exports.calculateAnnual = async (req, res) => {
    try {
        const { studentId, level, academicYear } = req.body;

        // Validation
        if (!studentId || !level || !academicYear) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: studentId, level, academicYear'
            });
        }

        // Calculate
        const result = await calculationService.calculateAnnualResult(
            studentId,
            level,
            academicYear
        );

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error calculating annual result:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to calculate annual result'
        });
    }
};

// @desc    Get Annual Results
// @route   GET /api/calculations/annual-results
// @access  Private/Admin
exports.getAnnualResults = async (req, res) => {
    try {
        const { studentId, academicYear, level } = req.query;
        const AnnualResult = require('../models/AnnualResult');

        const filter = {};
        if (studentId) filter.studentId = studentId;
        if (academicYear) filter.academicYear = academicYear;
        if (level) filter.level = level;

        const results = await AnnualResult.find(filter)
            .populate('studentId', 'firstName lastName registrationNumber')
            .populate('semester1.semesterId', 'name')
            .populate('semester2.semesterId', 'name')
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });
    } catch (error) {
        console.error('Error fetching annual results:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch annual results'
        });
    }
};

// @desc    Bulk Calculate Annual Results
// @route   POST /api/calculations/annual/bulk
// @access  Private/Admin
exports.bulkCalculateAnnual = async (req, res) => {
    try {
        const { students, academicYear, level } = req.body;

        if (!students || !Array.isArray(students) || students.length === 0 || !academicYear || !level) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: students (array), academicYear, level'
            });
        }

        const results = [];
        const errors = [];

        // Process in parallel with Promise.allSettled
        const promises = students.map(async (studentId) => {
            try {
                return await calculationService.calculateAnnualResult(
                    studentId,
                    level,
                    academicYear
                );
            } catch (err) {
                throw new Error(`Student ${studentId}: ${err.message}`);
            }
        });

        const outcomes = await Promise.allSettled(promises);

        outcomes.forEach((outcome, index) => {
            if (outcome.status === 'fulfilled') {
                results.push(outcome.value);
            } else {
                errors.push({
                    studentId: students[index],
                    error: outcome.reason.message
                });
            }
        });

        res.status(200).json({
            success: true,
            message: `Processed ${students.length} students. Success: ${results.length}, Failed: ${errors.length}`,
            results,
            errors
        });

    } catch (error) {
        console.error('Error in bulk annual calculation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to perform bulk calculation'
        });
    }
};

// @desc    Bulk Calculate Semester Results
// @route   POST /api/calculations/semester/bulk
// @access  Private/Admin
exports.bulkCalculateSemester = async (req, res) => {
    try {
        const { promotionId, semesterId, academicYear } = req.body;

        if (!promotionId || !semesterId || !academicYear) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: promotionId, semesterId, academicYear'
            });
        }

        const Student = require('../models/Student');
        const Semester = require('../models/Semester');

        const semester = await Semester.findById(semesterId);
        if (!semester) {
            return res.status(404).json({ success: false, message: 'Semester not found' });
        }

        if (semester.promotionId.toString() !== promotionId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Semester does not belong to the selected promotion'
            });
        }

        const students = await Student.find({
            promotionId,
            academicYear,
            isActive: true
        }).select('_id');

        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'No students found for this promotion' });
        }

        const results = [];
        const errors = [];

        const promises = students.map(async (student) => {
            try {
                return await calculationService.calculateSemesterAverage(
                    student._id,
                    semesterId,
                    academicYear
                );
            } catch (err) {
                throw new Error(`Student ${student._id}: ${err.message}`);
            }
        });

        const outcomes = await Promise.allSettled(promises);

        outcomes.forEach((outcome, index) => {
            if (outcome.status === 'fulfilled') {
                results.push(outcome.value);
            } else {
                errors.push({
                    studentId: students[index]._id,
                    error: outcome.reason.message
                });
            }
        });

        res.status(200).json({
            success: true,
            message: `Processed ${students.length} students. Success: ${results.length}, Failed: ${errors.length}`,
            results,
            errors
        });
    } catch (error) {
        console.error('Error in bulk semester calculation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to perform bulk semester calculation'
        });
    }
};
