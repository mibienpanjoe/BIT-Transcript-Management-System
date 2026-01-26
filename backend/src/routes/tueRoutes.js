const express = require('express');
const {
    getTUEs,
    getTUE,
    createTUE,
    updateTUE,
    deleteTUE,
} = require('../controllers/tueController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @openapi
 * /api/tues:
 *   get:
 *     tags: [TUEs]
 *     summary: List TUEs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of TUEs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 count: { type: integer }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/TUE' }
 *   post:
 *     tags: [TUEs]
 *     summary: Create TUE
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TUE'
 *     responses:
 *       201:
 *         description: TUE created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/TUE' }
 *
 * /api/tues/{id}:
 *   get:
 *     tags: [TUEs]
 *     summary: Get TUE
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: TUE
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/TUE' }
 *   put:
 *     tags: [TUEs]
 *     summary: Update TUE
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
 *             $ref: '#/components/schemas/TUE'
 *     responses:
 *       200:
 *         description: TUE updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/TUE' }
 *   delete:
 *     tags: [TUEs]
 *     summary: Delete TUE
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: TUE deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

// Protect all routes
router.use(protect);

// Allow schooling_manager to read, but only admin can create/update/delete
router.route('/')
    .get(authorize('admin', 'schooling_manager'), getTUEs)
    .post(authorize('admin'), createTUE);

router.route('/:id')
    .get(authorize('admin', 'schooling_manager'), getTUE)
    .put(authorize('admin'), updateTUE)
    .delete(authorize('admin'), deleteTUE);

module.exports = router;
