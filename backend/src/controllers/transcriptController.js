const Student = require('../models/Student');
const Semester = require('../models/Semester');
const SemesterResult = require('../models/SemesterResult');
const TUResult = require('../models/TUResult');
const pdfService = require('../services/pdfService');

// @desc    Get student transcript data for viewer
// @route   GET /api/transcripts/student/:studentId
// @access  Private/Admin
exports.getStudentTranscript = async (req, res) => {
    try {
        const { studentId } = req.params;
        const academicYear = req.query.academicYear || new Date().getFullYear().toString();

        const student = await Student.findById(studentId)
            .populate('fieldId')
            .populate('promotionId');

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Fetch all semesters for this promotion
        const semesters = await Semester.find({
            promotionId: student.promotionId._id
        }).sort({ startDate: 1 });

        const semestersData = [];

        for (const semester of semesters) {
            const semResult = await SemesterResult.findOne({
                studentId,
                semesterId: semester._id,
                academicYear
            });

            // Fetch TU results for this semester
            const tuResults = await TUResult.find({
                studentId,
                academicYear
            }).populate('tuId');

            // Filter for this semester
            const semesterTUResults = tuResults.filter(r => r.tuId.semesterId.toString() === semester._id.toString());

            const tusData = semesterTUResults.map(r => ({
                tuId: r.tuId._id,
                name: r.tuId.name,
                average: r.average,
                creditsEarned: r.creditsEarned,
                totalCredits: r.tuId.credits,
                validationStatus: r.status
            }));

            semestersData.push({
                semesterId: semester._id,
                semesterName: semester.name,
                average: semResult ? semResult.average : 0,
                isValidated: semResult ? semResult.status === 'VALIDATED' : false,
                decision: semResult ? semResult.status : 'PENDING',
                tus: tusData
            });
        }

        res.status(200).json({
            success: true,
            data: {
                student: {
                    _id: student._id,
                    firstName: student.firstName,
                    lastName: student.lastName,
                    studentId: student.studentId,
                    field: student.fieldId
                },
                semesters: semestersData
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Generate Transcript PDF
// @route   GET /api/transcripts/student/:studentId/pdf
// @access  Private/Admin
exports.generateTranscriptPDF = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { semesterId } = req.params; // Optional if route is /semester/:semesterId/student/:studentId/pdf
        const academicYear = req.query.academicYear || new Date().getFullYear().toString();

        res.setHeader('Content-Type', 'application/pdf');
        const filename = `transcript_${studentId}.pdf`;
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        await pdfService.generateTranscript(studentId, semesterId, academicYear, res);

    } catch (err) {
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
};

// @desc    Bulk Generate Transcripts
// @route   POST /api/transcripts/bulk-generate
// @access  Private/Admin
exports.bulkGenerateTranscripts = async (req, res) => {
    try {
        const { studentIds, semesterId } = req.body;

        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({ success: false, message: 'No students provided' });
        }

        // In a real production app, this should be a background job (Bull/Redis)
        // For now, we'll just acknowledge the request.
        // Implementing actual bulk generation and zipping would take significant time
        // and might timeout the request.

        // TODO: Implement background job for bulk generation

        res.status(200).json({
            success: true,
            message: `Bulk generation started for ${studentIds.length} students. (Note: This is a placeholder response)`
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
