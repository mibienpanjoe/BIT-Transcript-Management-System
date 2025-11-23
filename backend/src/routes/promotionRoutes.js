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

// Protect all routes and restrict to admin
router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .get(getPromotions)
    .post(createPromotion);

router.route('/:id')
    .get(getPromotion)
    .put(updatePromotion)
    .delete(deletePromotion);

module.exports = router;
