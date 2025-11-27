const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
    getStudentTranscript,
    generateTranscriptPDF,
    bulkGenerateTranscripts
} = require('../controllers/transcriptController');

const router = express.Router();

// Protect all routes and restrict to admin
router.use(protect);
router.use(authorize('admin'));

router.get('/student/:studentId', getStudentTranscript);
router.get('/student/:studentId/pdf', generateTranscriptPDF);
router.get('/semester/:semesterId/student/:studentId/pdf', generateTranscriptPDF); // Support semester specific
router.post('/bulk-generate', bulkGenerateTranscripts);

module.exports = router;
