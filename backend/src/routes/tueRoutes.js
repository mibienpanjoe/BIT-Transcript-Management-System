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

// Protect all routes and restrict to admin
router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .get(getTUEs)
    .post(createTUE);

router.route('/:id')
    .get(getTUE)
    .put(updateTUE)
    .delete(deleteTUE);

module.exports = router;
