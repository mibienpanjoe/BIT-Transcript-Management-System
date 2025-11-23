const express = require('express');
const { getTranscript } = require('../controllers/pdfController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes and restrict to admin
router.use(protect);
router.use(authorize('admin'));

router.get('/transcript', getTranscript);

module.exports = router;
