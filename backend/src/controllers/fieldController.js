const Field = require('../models/Field');

// @desc    Get all fields
// @route   GET /api/fields
// @access  Private/Admin
exports.getFields = async (req, res) => {
    try {
        const fields = await Field.find({ isActive: true });

        res.status(200).json({
            success: true,
            count: fields.length,
            data: fields,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get single field
// @route   GET /api/fields/:id
// @access  Private/Admin
exports.getField = async (req, res) => {
    try {
        const field = await Field.findById(req.params.id);

        if (!field) {
            return res.status(404).json({ success: false, message: 'Field not found' });
        }

        res.status(200).json({
            success: true,
            data: field,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Create field
// @route   POST /api/fields
// @access  Private/Admin
exports.createField = async (req, res) => {
    try {
        const field = await Field.create(req.body);

        res.status(201).json({
            success: true,
            data: field,
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update field
// @route   PUT /api/fields/:id
// @access  Private/Admin
exports.updateField = async (req, res) => {
    try {
        const field = await Field.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!field) {
            return res.status(404).json({ success: false, message: 'Field not found' });
        }

        res.status(200).json({
            success: true,
            data: field,
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete field (Soft delete)
// @route   DELETE /api/fields/:id
// @access  Private/Admin
exports.deleteField = async (req, res) => {
    try {
        const field = await Field.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });

        if (!field) {
            return res.status(404).json({ success: false, message: 'Field not found' });
        }

        res.status(200).json({
            success: true,
            data: {},
            message: 'Field deactivated'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
