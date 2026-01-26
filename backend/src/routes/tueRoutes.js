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
