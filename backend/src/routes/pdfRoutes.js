const express = require('express');
const { getTranscript } = require('../controllers/pdfController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @openapi
 * /api/pdf/transcript:
 *   get:
 *     tags: [PDF]
 *     summary: Generate a transcript PDF
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: studentId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: semesterId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: PDF stream
 */

// Protect all routes and restrict to admin
router.use(protect);
router.use(authorize('admin'));

router.get('/transcript', getTranscript);

module.exports = router;
