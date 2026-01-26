const express = require('express');
const {
    getTUs,
    getTU,
    createTU,
    updateTU,
    deleteTU,
} = require('../controllers/tuController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @openapi
 * /api/tus:
 *   get:
 *     tags: [TUs]
 *     summary: List TUs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of TUs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 count: { type: integer }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/TU' }
 *   post:
 *     tags: [TUs]
 *     summary: Create TU
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TU'
 *     responses:
 *       201:
 *         description: TU created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/TU' }
 *
 * /api/tus/{id}:
 *   get:
 *     tags: [TUs]
 *     summary: Get TU
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: TU
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/TU' }
 *   put:
 *     tags: [TUs]
 *     summary: Update TU
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
 *             $ref: '#/components/schemas/TU'
 *     responses:
 *       200:
 *         description: TU updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/TU' }
 *   delete:
 *     tags: [TUs]
 *     summary: Delete TU
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: TU deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

// Protect all routes and restrict to admin
router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .get(getTUs)
    .post(createTU);

router.route('/:id')
    .get(getTU)
    .put(updateTU)
    .delete(deleteTU);

module.exports = router;
