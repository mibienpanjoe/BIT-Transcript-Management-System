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

// Protect all routes and restrict to admin
router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .get(getFields)
    .post(createField);

router.route('/:id')
    .get(getField)
    .put(updateField)
    .delete(deleteField);

module.exports = router;
