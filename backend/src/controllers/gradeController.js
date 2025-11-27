const Grade = require('../models/Grade');
const Student = require('../models/Student');
const TUE = require('../models/TUE');
const excelService = require('../services/excelService');

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

        // Teacher lock check: prevent teachers from modifying existing grades
        if (req.user.role === 'teacher' && grade) {
            const hasExistingValues =
                (grade.participation !== null && grade.participation !== 0) ||
                (grade.evaluation !== null && grade.evaluation !== 0);

            if (hasExistingValues) {
                return res.status(403).json({
                    success: false,
                    message: 'You cannot modify grades after submission. Please contact an administrator if changes are needed.'
                });
            }
        }

        // Schooling Manager lock check: prevent modifying existing presence
        if (req.user.role === 'schooling_manager' && grade) {
            if (grade.presence !== undefined && grade.presence !== null && grade.presence !== 0) {
                return res.status(403).json({
                    success: false,
                    message: 'You cannot modify attendance after submission. Please contact an administrator if changes are needed.'
                });
            }
        }

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

// @desc    Import grades from Excel
// @route   POST /api/grades/import/:tueId
// @access  Private/Teacher/Admin
exports.importGrades = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const tueId = req.params.tueId;
        const { academicYear } = req.body;

        // Verify TUE exists
        const tue = await TUE.findById(tueId);
        if (!tue) {
            return res.status(404).json({ success: false, message: 'TUE not found' });
        }

        // Parse Excel
        const data = await excelService.parseGradeExcel(req.file.buffer);

        // Validate and structure grade data
        const validation = await excelService.validateGradeData(data, tueId);

        if (validation.errors.length > 0 && validation.success === 0) {
            return res.status(400).json({
                success: false,
                message: 'Grade import failed',
                errors: validation.errors
            });
        }

        // Batch create/update grades
        const promises = validation.grades.map(async (gradeData) => {
            let grade = await Grade.findOne({
                studentId: gradeData.studentId,
                tueId: gradeData.tueId
            });

            if (grade) {
                // Update existing
                grade.participation = gradeData.participation;
                grade.evaluation = gradeData.evaluation;
                if (academicYear) grade.academicYear = academicYear;
                await grade.save();
                return grade;
            } else {
                // Create new
                return await Grade.create({
                    ...gradeData,
                    academicYear: academicYear || new Date().getFullYear().toString()
                });
            }
        });

        await Promise.all(promises);

        res.status(200).json({
            success: true,
            message: `Successfully imported ${validation.success} grades`,
            imported: validation.success,
            errors: validation.errors
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Download grade template for TUE
// @route   GET /api/grades/template/:tueId
// @access  Private/Teacher/Admin
exports.downloadTemplate = async (req, res) => {
    try {
        const tueId = req.params.tueId;

        // Get TUE with its relationships to find students
        const tue = await TUE.findById(tueId)
            .populate({
                path: 'tuId',
                populate: {
                    path: 'semesterId',
                    populate: {
                        path: 'promotionId'
                    }
                }
            });

        if (!tue) {
            return res.status(404).json({ success: false, message: 'TUE not found' });
        }

        // Get promotion ID from the hierarchy
        const promotionId = tue.tuId.semesterId.promotionId._id;

        // Get all students in this promotion
        const students = await Student.find({
            promotionId,
            isActive: true
        }).sort({ studentId: 1 });

        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'No students found for this TUE' });
        }

        // Generate Excel template
        const buffer = await excelService.generateGradeTemplate(tue, students);

        // Set headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Grade_Template_${tue.code}.xlsx`);

        res.send(buffer);

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get TUEs assigned to logged-in teacher
// @route   GET /api/grades/my-tues
// @access  Private/Teacher
exports.getMyTUEs = async (req, res) => {
    try {
        // Find TUEs where teacherId matches logged-in user
        const tues = await TUE.find({ teacherId: req.user.id })
            .populate('tuId', 'name code')
            .sort({ code: 1 });

        res.status(200).json({
            success: true,
            count: tues.length,
            data: tues
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all students and their grades for a specific TUE
// @route   GET /api/grades/tue/:tueId
// @access  Private/Teacher/Admin
exports.getGradesForTUE = async (req, res) => {
    try {
        const { tueId } = req.params;

        // Get TUE details with hierarchy to find promotion
        const tue = await TUE.findById(tueId)
            .populate({
                path: 'tuId',
                populate: {
                    path: 'semesterId',
                    populate: {
                        path: 'promotionId'
                    }
                }
            });

        if (!tue) {
            return res.status(404).json({ success: false, message: 'TUE not found' });
        }

        // Get all students in the promotion
        const promotionId = tue.tuId.semesterId.promotionId._id;
        const students = await Student.find({ promotionId, isActive: true })
            .sort({ lastName: 1, firstName: 1 });

        // Check if user is admin
        const isAdmin = req.user.role === 'admin';

        // Get grades for each student
        const gradesData = await Promise.all(
            students.map(async (student) => {
                const grade = await Grade.findOne({ studentId: student._id, tueId });

                // Determine if grade is editable
                let isEditable = true;
                if (!isAdmin && grade) {
                    if (req.user.role === 'teacher') {
                        // For teachers: locked if values exist
                        const hasValues =
                            (grade.participation !== null && grade.participation !== 0) ||
                            (grade.evaluation !== null && grade.evaluation !== 0);
                        isEditable = !hasValues;
                    } else if (req.user.role === 'schooling_manager') {
                        // For schooling manager: locked if presence exists
                        const hasPresence = grade.presence !== undefined && grade.presence !== null && grade.presence !== 0;
                        isEditable = !hasPresence;
                    }
                }

                return {
                    student,
                    grade: grade ? {
                        ...grade._doc,
                        isEditable
                    } : {
                        participation: null,
                        evaluation: null,
                        presence: null,
                        finalGrade: null,
                        isEditable
                    }
                };
            })
        );

        res.status(200).json({
            success: true,
            data: {
                tue,
                students: gradesData
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Download attendance template for TUE
// @route   GET /api/grades/attendance/template/:tueId
// @access  Private/SchoolingManager/Admin
exports.downloadAttendanceTemplate = async (req, res) => {
    try {
        const tueId = req.params.tueId;

        // Get TUE with its relationships to find students
        const tue = await TUE.findById(tueId)
            .populate({
                path: 'tuId',
                populate: {
                    path: 'semesterId',
                    populate: {
                        path: 'promotionId'
                    }
                }
            });

        if (!tue) {
            return res.status(404).json({ success: false, message: 'TUE not found' });
        }

        // Get promotion ID from the hierarchy
        const promotionId = tue.tuId.semesterId.promotionId._id;

        // Get all students in this promotion
        const students = await Student.find({
            promotionId,
            isActive: true
        }).sort({ studentId: 1 });

        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'No students found for this TUE' });
        }

        // Generate Excel template
        const buffer = await excelService.generateAttendanceTemplate(tue, students);

        // Set headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Attendance_Template_${tue.code}.xlsx`);

        res.send(buffer);

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Import attendance from Excel
// @route   POST /api/grades/attendance/import/:tueId
// @access  Private/SchoolingManager/Admin
exports.importAttendance = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const tueId = req.params.tueId;
        const { academicYear } = req.body;

        // Verify TUE exists
        const tue = await TUE.findById(tueId);
        if (!tue) {
            return res.status(404).json({ success: false, message: 'TUE not found' });
        }

        // Parse Excel
        const data = await excelService.parseGradeExcel(req.file.buffer); // Reusing parseGradeExcel as it just reads sheet to json

        // Validate and structure attendance data
        const validation = await excelService.validateAttendanceData(data, tueId);

        if (validation.errors.length > 0 && validation.success === 0) {
            return res.status(400).json({
                success: false,
                message: 'Attendance import failed',
                errors: validation.errors
            });
        }

        // Batch create/update grades
        const promises = validation.grades.map(async (gradeData) => {
            let grade = await Grade.findOne({
                studentId: gradeData.studentId,
                tueId: gradeData.tueId
            });

            // Check for locking if user is schooling_manager
            if (req.user.role === 'schooling_manager' && grade) {
                // If presence is already set and non-zero (or we consider any existing record as locked if we want strict lock)
                // Let's assume strict lock: if presence is already there, can't update.
                if (grade.presence !== undefined && grade.presence !== null && grade.presence !== 0) {
                    // Skip update for this student
                    return grade;
                }
            }

            if (grade) {
                // Update existing
                grade.presence = gradeData.presence;
                if (academicYear) grade.academicYear = academicYear;
                await grade.save();
                return grade;
            } else {
                // Create new
                return await Grade.create({
                    ...gradeData,
                    academicYear: academicYear || new Date().getFullYear().toString()
                });
            }
        });

        await Promise.all(promises);

        res.status(200).json({
            success: true,
            message: `Successfully imported ${validation.success} attendance records`,
            imported: validation.success,
            errors: validation.errors
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
