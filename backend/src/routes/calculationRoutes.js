const express = require('express');
const {
    calculateTU,
    calculateSemester,
    getTUResults,
    getSemesterResults,
    calculateAnnual,
    getAnnualResults,
    bulkCalculateAnnual
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
router.post('/annual', calculateAnnual);
router.post('/annual/bulk', bulkCalculateAnnual);
router.get('/annual-results', getAnnualResults);

module.exports = router;
