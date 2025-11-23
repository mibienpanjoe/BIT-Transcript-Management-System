const Grade = require('../models/Grade');
const Student = require('../models/Student');
const TUE = require('../models/TUE');

// @desc    Get all grades
// @route   GET /api/grades
// @access  Private/Admin/Teacher
exports.getGrades = async (req, res) => {
    try {
        const { studentId, tueId, academicYear } = req.query;
        let query = {};

        if (studentId) query.studentId = studentId;
        if (tueId) query.tueId = tueId;
        if (academicYear) query.academicYear = academicYear;

        // If teacher, might restrict to their TUEs (logic to be added later)

        const grades = await Grade.find(query)
            .populate('studentId', 'firstName lastName studentId')
            .populate({
                path: 'tueId',
                select: 'name code',
                populate: {
                    path: 'tuId',
                    select: 'name code'
                }
            });

        res.status(200).json({
            success: true,
            count: grades.length,
            data: grades,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get single grade
// @route   GET /api/grades/:id
// @access  Private/Admin/Teacher
exports.getGrade = async (req, res) => {
    try {
        const grade = await Grade.findById(req.params.id)
            .populate('studentId', 'firstName lastName studentId')
            .populate('tueId', 'name code');

        if (!grade) {
            return res.status(404).json({ success: false, message: 'Grade not found' });
        }

        res.status(200).json({
            success: true,
            data: grade,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Create or Update grade
// @route   POST /api/grades
// @access  Private/Admin/Teacher
exports.createOrUpdateGrade = async (req, res) => {
    try {
        const { studentId, tueId, presence, participation, evaluation, academicYear } = req.body;

        // Check if grade exists
        let grade = await Grade.findOne({ studentId, tueId });

        if (grade) {
            // Update
            grade.presence = presence !== undefined ? presence : grade.presence;
            grade.participation = participation !== undefined ? participation : grade.participation;
            grade.evaluation = evaluation !== undefined ? evaluation : grade.evaluation;
            grade.academicYear = academicYear || grade.academicYear;

            await grade.save();
        } else {
            // Create
            grade = await Grade.create({
                studentId,
                tueId,
                presence,
                participation,
                evaluation,
                academicYear
            });
        }

        res.status(200).json({
            success: true,
            data: grade,
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete grade
// @route   DELETE /api/grades/:id
// @access  Private/Admin
exports.deleteGrade = async (req, res) => {
    try {
        const grade = await Grade.findByIdAndDelete(req.params.id);

        if (!grade) {
            return res.status(404).json({ success: false, message: 'Grade not found' });
        }

        res.status(200).json({
            success: true,
            data: {},
            message: 'Grade deleted'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
