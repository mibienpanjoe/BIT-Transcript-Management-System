const Student = require('../models/Student');
const Semester = require('../models/Semester');
const SemesterResult = require('../models/SemesterResult');
const TUResult = require('../models/TUResult');
const pdfService = require('../services/puppeteerPdfService');
const archiver = require('archiver');

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

        // Fetch all semesters for this promotion, sorted by order
        const semesters = await Semester.find({
            promotionId: student.promotionId._id
        }).sort({ order: 1 }); // Fixed: use order instead of startDate

        const semestersData = [];

        for (const semester of semesters) {
            const semResult = await SemesterResult.findOne({
                studentId,
                semesterId: semester._id,
                academicYear
            });

            // Fetch TU results for this semester with proper population
            const tuResults = await TUResult.find({
                studentId,
                semesterId: semester._id, // Filter at query level
                academicYear
            }).populate({
                path: 'tuId',
                select: 'name code credits'
            });

            const tusData = tuResults.map(r => ({
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

// @desc    Validate Transcript Readiness
// @route   GET /api/transcripts/validate/:studentId
// @access  Private/Admin
exports.validateTranscript = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { academicYear, level } = req.query;

        if (!academicYear || !level) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters: academicYear, level'
            });
        }

        const validationService = require('../services/validationService');
        const validation = await validationService.validateTranscriptReadiness(
            studentId,
            academicYear,
            level
        );

        res.status(200).json({
            success: true,
            ...validation
        });
    } catch (error) {
        console.error('Error validating transcript:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate transcript readiness'
        });
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
        const { lang } = req.query;
        const level = req.query.level; // Optional validation

        // Optional: Validate readiness before generating
        if (level) {
            const validationService = require('../services/validationService');
            const validation = await validationService.validateTranscriptReadiness(
                studentId,
                academicYear,
                level
            );

            if (!validation.readyForTranscript) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot generate transcript. Missing required data.',
                    validation
                });
            }
        }

        res.setHeader('Content-Type', 'application/pdf');
        const filename = `transcript_${studentId}.pdf`;
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        await pdfService.generateTranscript(studentId, semesterId, academicYear, res, lang);

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
        const { studentIds, semesterId, promotionId, academicYear, lang } = req.body;

        if (!academicYear) {
            return res.status(400).json({ success: false, message: 'academicYear is required' });
        }

        let students = [];

        if (promotionId) {
            students = await Student.find({
                promotionId,
                academicYear,
                isActive: true
            }).sort({ studentId: 1 });
        } else if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
            students = await Student.find({
                _id: { $in: studentIds },
                isActive: true
            }).sort({ studentId: 1 });
        } else {
            return res.status(400).json({ success: false, message: 'Provide studentIds or promotionId' });
        }

        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'No students found' });
        }

        const zipName = `transcripts_${promotionId || 'selection'}_${academicYear}_${lang || 'en'}.zip`;
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=${zipName}`);

        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.on('error', (err) => {
            console.error('Zip error:', err);
            if (!res.headersSent) {
                res.status(500).json({ success: false, message: 'Failed to generate ZIP' });
            }
        });

        archive.pipe(res);

        const errors = [];
        for (const student of students) {
            try {
                const pdfBuffer = await pdfService.generateTranscriptBuffer(
                    student._id,
                    semesterId,
                    academicYear,
                    lang
                );
                const safeId = (student.studentId || student._id.toString()).replace(/[^a-zA-Z0-9_-]/g, '_');
                const safeName = `${student.lastName || ''}_${student.firstName || ''}`.replace(/[^a-zA-Z0-9_-]/g, '_');
                const filename = `transcript_${safeId}_${safeName}.pdf`;
                archive.append(pdfBuffer, { name: filename });
            } catch (err) {
                errors.push(`${student.studentId || student._id}: ${err.message}`);
            }
        }

        if (errors.length > 0) {
            archive.append(errors.join('\n'), { name: 'errors.txt' });
        }

        await archive.finalize();

    } catch (err) {
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
};
