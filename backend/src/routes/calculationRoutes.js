const express = require('express');
const {
    calculateTU,
    calculateSemester,
    getTUResults,
    getSemesterResults,
} = require('../controllers/calculationController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes and restrict to admin
router.use(protect);
router.use(authorize('admin'));

router.post('/tu', calculateTU);
router.post('/semester', calculateSemester);
router.get('/tu-results', getTUResults);
router.get('/semester-results', getSemesterResults);

module.exports = router;
