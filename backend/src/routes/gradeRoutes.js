const express = require('express');
const multer = require('multer');
const {
    getGrades,
    getGrade,
    createOrUpdateGrade,
    deleteGrade,
    importGrades,
    downloadTemplate,
    getMyTUEs,
    getGradesForTUE,
    downloadAttendanceTemplate,
    importAttendance
} = require('../controllers/gradeController');

const { protect, authorize } = require('../middleware/auth');
const { validateGradeContext, validateBulkGradeContext } = require('../middleware/gradeValidation');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Protect all routes
router.use(protect);

// Teacher routes
router.get('/my-tues', authorize('admin', 'teacher'), getMyTUEs);
router.get('/tue/:tueId', authorize('admin', 'teacher', 'schooling_manager'), getGradesForTUE);

// Download grade template for TUE
router.get('/template/:tueId', authorize('admin', 'teacher'), downloadTemplate);

// Download attendance template for TUE
router.get('/attendance/template/:tueId', authorize('admin', 'schooling_manager'), downloadAttendanceTemplate);

// Import grades from Excel (with validation middleware)
router.post('/import/:tueId', authorize('admin', 'teacher'), upload.single('file'), validateBulkGradeContext, importGrades);

// Import attendance from Excel (with validation middleware)
router.post('/attendance/import/:tueId', authorize('admin', 'schooling_manager'), upload.single('file'), validateBulkGradeContext, importAttendance);

// Teachers and Admins can view and manage grades
router.route('/')
    .get(authorize('admin', 'teacher', 'schooling_manager'), getGrades)
    .post(authorize('admin', 'teacher', 'schooling_manager'), validateGradeContext, createOrUpdateGrade);

router.route('/:id')
    .get(authorize('admin', 'teacher', 'schooling_manager'), getGrade)
    .delete(authorize('admin'), deleteGrade); // Only admin can delete

module.exports = router;
