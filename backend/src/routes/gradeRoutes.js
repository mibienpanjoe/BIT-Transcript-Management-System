const express = require('express');
const multer = require('multer');
const {
    getGrades,
    getGrade,
    createOrUpdateGrade,
    deleteGrade,
    importGrades,
    downloadTemplate,
    getMyTUEs,
    getGradesForTUE,
    downloadAttendanceTemplate,
    importAttendance
} = require('../controllers/gradeController');

const { protect, authorize } = require('../middleware/auth');
const { validateGradeContext, validateBulkGradeContext } = require('../middleware/gradeValidation');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @openapi
 * /api/grades/my-tues:
 *   get:
 *     tags: [Grades]
 *     summary: List TUEs assigned to current teacher
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: TUE list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *
 * /api/grades/tue/{tueId}:
 *   get:
 *     tags: [Grades]
 *     summary: Get grades for a TUE
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tueId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Grades for TUE
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *
 * /api/grades/template/{tueId}:
 *   get:
 *     tags: [Grades]
 *     summary: Download grade template for TUE
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tueId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Excel template
 *
 * /api/grades/attendance/template/{tueId}:
 *   get:
 *     tags: [Grades]
 *     summary: Download attendance template for TUE
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tueId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Excel template
 *
 * /api/grades/import/{tueId}:
 *   post:
 *     tags: [Grades]
 *     summary: Import grades from Excel
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tueId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Import results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *
 * /api/grades/attendance/import/{tueId}:
 *   post:
 *     tags: [Grades]
 *     summary: Import attendance from Excel
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tueId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Import results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *
 * /api/grades:
 *   get:
 *     tags: [Grades]
 *     summary: List grades
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of grades
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 count: { type: integer }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Grade' }
 *   post:
 *     tags: [Grades]
 *     summary: Create or update grade
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studentId, tueId, academicYear]
 *             properties:
 *               studentId: { type: string }
 *               tueId: { type: string }
 *               academicYear: { type: string }
 *               presence: { type: number }
 *               participation: { type: number }
 *               evaluation: { type: number }
 *     responses:
 *       200:
 *         description: Grade created or updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Grade' }
 *
 * /api/grades/{id}:
 *   get:
 *     tags: [Grades]
 *     summary: Get grade
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Grade
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Grade' }
 *   delete:
 *     tags: [Grades]
 *     summary: Delete grade
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Grade deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

// Protect all routes
router.use(protect);

// Teacher routes
router.get('/my-tues', authorize('admin', 'teacher'), getMyTUEs);
router.get('/tue/:tueId', authorize('admin', 'teacher', 'schooling_manager'), getGradesForTUE);

// Download grade template for TUE
router.get('/template/:tueId', authorize('admin', 'teacher'), downloadTemplate);

// Download attendance template for TUE
router.get('/attendance/template/:tueId', authorize('admin', 'schooling_manager'), downloadAttendanceTemplate);

// Import grades from Excel (with validation middleware)
router.post('/import/:tueId', authorize('admin', 'teacher'), upload.single('file'), validateBulkGradeContext, importGrades);

// Import attendance from Excel (with validation middleware)
router.post('/attendance/import/:tueId', authorize('admin', 'schooling_manager'), upload.single('file'), validateBulkGradeContext, importAttendance);

// Teachers and Admins can view and manage grades
router.route('/')
    .get(authorize('admin', 'teacher', 'schooling_manager'), getGrades)
    .post(authorize('admin', 'teacher', 'schooling_manager'), validateGradeContext, createOrUpdateGrade);

router.route('/:id')
    .get(authorize('admin', 'teacher', 'schooling_manager'), getGrade)
    .delete(authorize('admin'), deleteGrade); // Only admin can delete

module.exports = router;
