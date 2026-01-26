const express = require('express');
const {
    getPromotions,
    getPromotion,
    createPromotion,
    updatePromotion,
    deletePromotion,
} = require('../controllers/promotionController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @openapi
 * /api/promotions:
 *   get:
 *     tags: [Promotions]
 *     summary: List promotions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of promotions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 count: { type: integer }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Promotion' }
 *   post:
 *     tags: [Promotions]
 *     summary: Create promotion
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Promotion'
 *     responses:
 *       201:
 *         description: Promotion created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Promotion' }
 *
 * /api/promotions/{id}:
 *   get:
 *     tags: [Promotions]
 *     summary: Get promotion
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Promotion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Promotion' }
 *   put:
 *     tags: [Promotions]
 *     summary: Update promotion
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
 *             $ref: '#/components/schemas/Promotion'
 *     responses:
 *       200:
 *         description: Promotion updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Promotion' }
 *   delete:
 *     tags: [Promotions]
 *     summary: Delete promotion
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Promotion deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

// Protect all routes
router.use(protect);

// Allow schooling_manager to read, but only admin can create/update/delete
router.route('/')
    .get(authorize('admin', 'schooling_manager'), getPromotions)
    .post(authorize('admin'), createPromotion);

router.route('/:id')
    .get(authorize('admin', 'schooling_manager'), getPromotion)
    .put(authorize('admin'), updatePromotion)
    .delete(authorize('admin'), deletePromotion);

module.exports = router;
