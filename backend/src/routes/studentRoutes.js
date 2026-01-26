const express = require('express');
const multer = require('multer');
const {
    getStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    importStudents,
    getStudentsByPromotion,
} = require('../controllers/studentController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Protect all routes and restrict to admin
router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .get(getStudents)
    .post(createStudent);

router.post('/import', upload.single('file'), importStudents);

// IMPORTANT: This must come BEFORE /:id to avoid matching "promotion" as an ID
router.get('/promotion/:promotionId', getStudentsByPromotion);

router.route('/:id')
    .get(getStudent)
    .put(updateStudent)
    .delete(deleteStudent);

module.exports = router;
