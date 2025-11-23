const express = require('express');
const {
    getGrades,
    getGrade,
    createOrUpdateGrade,
    deleteGrade,
} = require('../controllers/gradeController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Teachers and Admins can view and manage grades
router.route('/')
    .get(authorize('admin', 'teacher'), getGrades)
    .post(authorize('admin', 'teacher'), createOrUpdateGrade);

router.route('/:id')
    .get(authorize('admin', 'teacher'), getGrade)
    .delete(authorize('admin'), deleteGrade); // Only admin can delete

module.exports = router;
