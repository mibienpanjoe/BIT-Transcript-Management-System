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

// Protect all routes and restrict to admin
router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .get(getSemesters)
    .post(createSemester);

router.route('/:id')
    .get(getSemester)
    .put(updateSemester)
    .delete(deleteSemester);

module.exports = router;
