const express = require('express');
const {
    getSemesters,
    getSemester,
    createSemester,
    updateSemester,
    deleteSemester,
} = require('../controllers/semesterController');
const { generateSemesterResultsPdf, generateSemesterResultsExcel } = require('../controllers/semesterResultsController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @openapi
 * /api/semesters:
 *   get:
 *     tags: [Semesters]
 *     summary: List semesters
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of semesters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 count: { type: integer }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Semester' }
 *   post:
 *     tags: [Semesters]
 *     summary: Create semester
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Semester'
 *     responses:
 *       201:
 *         description: Semester created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Semester' }
 *
 * /api/semesters/{id}:
 *   get:
 *     tags: [Semesters]
 *     summary: Get semester
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Semester
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Semester' }
 *   put:
 *     tags: [Semesters]
 *     summary: Update semester
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Semester'
 *     responses:
 *       200:
 *         description: Semester updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Semester' }
 *   delete:
 *     tags: [Semesters]
 *     summary: Delete semester
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Semester deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *
 * /api/semesters/results/pdf:
 *   post:
 *     tags: [Semesters]
 *     summary: Generate consolidated semester results PDF
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [promotionId, semesterId, academicYear]
 *             properties:
 *               promotionId: { type: string }
 *               semesterId: { type: string }
 *               academicYear: { type: string }
 *     responses:
 *       200:
 *         description: PDF stream
 *
 * /api/semesters/results/excel:
 *   post:
 *     tags: [Semesters]
 *     summary: Generate consolidated semester results Excel
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [promotionId, semesterId, academicYear]
 *             properties:
 *               promotionId: { type: string }
 *               semesterId: { type: string }
 *               academicYear: { type: string }
 *     responses:
 *       200:
 *         description: Excel file
 */

// Protect all routes
router.use(protect);

// Allow schooling_manager to read, but only admin can create/update/delete
router.route('/')
    .get(authorize('admin', 'schooling_manager'), getSemesters)
    .post(authorize('admin'), createSemester);

router.post('/results/pdf', authorize('admin'), generateSemesterResultsPdf);
router.post('/results/excel', authorize('admin'), generateSemesterResultsExcel);

router.route('/:id')
    .get(authorize('admin', 'schooling_manager'), getSemester)
    .put(authorize('admin'), updateSemester)
    .delete(authorize('admin'), deleteSemester);

module.exports = router;
