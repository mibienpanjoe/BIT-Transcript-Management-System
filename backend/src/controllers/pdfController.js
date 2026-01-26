const pdfService = require('../services/puppeteerPdfService');

// @desc    Generate Transcript PDF
// @route   GET /api/pdf/transcript
// @access  Private/Admin
exports.getTranscript = async (req, res) => {
    try {
        const { studentId, semesterId, academicYear } = req.query;

        // SemesterId is optional for annual transcript
        if (!studentId || !academicYear) {
            return res.status(400).json({ success: false, message: 'Please provide studentId and academicYear' });
        }

        // Headers are set in the service
        // res.setHeader('Content-Type', 'application/pdf');

        // const filename = semesterId
        //     ? `transcript_${studentId}_${semesterId}.pdf`
        //     : `transcript_${studentId}_${academicYear}.pdf`;

        // res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        await pdfService.generateTranscript(studentId, semesterId, academicYear, res);
    } catch (err) {
        // If headers already sent (stream started), we can't send JSON error
        if (res.headersSent) {
            return;
        }
        res.status(500).json({ success: false, message: err.message });
    }
};
