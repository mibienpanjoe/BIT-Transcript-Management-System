const express = require('express');
const {
    calculateTU,
    calculateSemester,
    getTUResults,
    getSemesterResults,
    calculateAnnual,
    getAnnualResults,
    bulkCalculateAnnual
} = require('../controllers/calculationController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @openapi
 * /api/calculations/tu:
 *   post:
 *     tags: [Calculations]
 *     summary: Calculate TU results
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studentId, tuId, academicYear]
 *             properties:
 *               studentId: { type: string }
 *               tuId: { type: string }
 *               academicYear: { type: string }
 *     responses:
 *       200:
 *         description: TU calculation done
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *
 * /api/calculations/semester:
 *   post:
 *     tags: [Calculations]
 *     summary: Calculate semester results
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studentId, semesterId, academicYear]
 *             properties:
 *               studentId: { type: string }
 *               semesterId: { type: string }
 *               academicYear: { type: string }
 *     responses:
 *       200:
 *         description: Semester calculation done
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *
 * /api/calculations/annual:
 *   post:
 *     tags: [Calculations]
 *     summary: Calculate annual results
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studentId, level, academicYear]
 *             properties:
 *               studentId: { type: string }
 *               level: { type: string, enum: [L1, L2, L3, M1, M2] }
 *               academicYear: { type: string }
 *     responses:
 *       200:
 *         description: Annual calculation done
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *
 * /api/calculations/annual/bulk:
 *   post:
 *     tags: [Calculations]
 *     summary: Bulk calculate annual results
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bulk calculation done
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *
 * /api/calculations/tu-results:
 *   get:
 *     tags: [Calculations]
 *     summary: List TU results
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: TU results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *
 * /api/calculations/semester-results:
 *   get:
 *     tags: [Calculations]
 *     summary: List semester results
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Semester results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *
 * /api/calculations/annual-results:
 *   get:
 *     tags: [Calculations]
 *     summary: List annual results
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Annual results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

// Protect all routes and restrict to admin
router.use(protect);
router.use(authorize('admin'));

router.post('/tu', calculateTU);
router.post('/semester', calculateSemester);
router.get('/tu-results', getTUResults);
router.get('/semester-results', getSemesterResults);
router.post('/annual', calculateAnnual);
router.post('/annual/bulk', bulkCalculateAnnual);
router.get('/annual-results', getAnnualResults);

module.exports = router;
