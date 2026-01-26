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
