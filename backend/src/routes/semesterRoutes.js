const express = require('express');
const {
    getSemesters,
    getSemester,
    createSemester,
    updateSemester,
    deleteSemester,
} = require('../controllers/semesterController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Allow schooling_manager to read, but only admin can create/update/delete
router.route('/')
    .get(authorize('admin', 'schooling_manager'), getSemesters)
    .post(authorize('admin'), createSemester);

router.route('/:id')
    .get(authorize('admin', 'schooling_manager'), getSemester)
    .put(authorize('admin'), updateSemester)
    .delete(authorize('admin'), deleteSemester);

module.exports = router;
