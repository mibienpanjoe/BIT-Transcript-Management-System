const express = require('express');
const {
    getFields,
    getField,
    createField,
    updateField,
    deleteField,
} = require('../controllers/fieldController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Allow schooling_manager to read, but only admin can create/update/delete
router.route('/')
    .get(authorize('admin', 'schooling_manager'), getFields)
    .post(authorize('admin'), createField);

router.route('/:id')
    .get(authorize('admin', 'schooling_manager'), getField)
    .put(authorize('admin'), updateField)
    .delete(authorize('admin'), deleteField);

module.exports = router;
