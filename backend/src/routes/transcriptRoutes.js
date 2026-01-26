const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
    getStudentTranscript,
    generateTranscriptPDF,
    bulkGenerateTranscripts,
    validateTranscript
} = require('../controllers/transcriptController');

const router = express.Router();

/**
 * @openapi
 * /api/transcripts/validate/{studentId}:
 *   get:
 *     tags: [Transcripts]
 *     summary: Validate transcript readiness
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Validation result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *
 * /api/transcripts/student/{studentId}:
 *   get:
 *     tags: [Transcripts]
 *     summary: Get student transcript data
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Transcript data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *
 * /api/transcripts/student/{studentId}/pdf:
 *   get:
 *     tags: [Transcripts]
 *     summary: Generate student transcript PDF
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: PDF stream
 *
 * /api/transcripts/semester/{semesterId}/student/{studentId}/pdf:
 *   get:
 *     tags: [Transcripts]
 *     summary: Generate semester transcript PDF
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: semesterId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: PDF stream
 *
 * /api/transcripts/bulk-generate:
 *   post:
 *     tags: [Transcripts]
 *     summary: Bulk generate transcripts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               semesterId: { type: string }
 *               promotionId: { type: string }
 *               academicYear: { type: string }
 *     responses:
 *       200:
 *         description: Bulk generation results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

// Protect all routes and restrict to admin
router.use(protect);
router.use(authorize('admin'));

router.get('/validate/:studentId', validateTranscript);
router.get('/student/:studentId', getStudentTranscript);
router.get('/student/:studentId/pdf', generateTranscriptPDF);
router.get('/semester/:semesterId/student/:studentId/pdf', generateTranscriptPDF); // Support semester specific
router.post('/bulk-generate', bulkGenerateTranscripts);

module.exports = router;
