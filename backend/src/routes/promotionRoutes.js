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
