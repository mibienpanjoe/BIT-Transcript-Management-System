const TU = require('../models/TU');

// @desc    Get all TUs
// @route   GET /api/tus
// @access  Private/Admin
exports.getTUs = async (req, res) => {
    try {
        const { semesterId } = req.query;
        let query = { isActive: true };

        if (semesterId) query.semesterId = semesterId;

        const tus = await TU.find(query).populate({
            path: 'semesterId',
            select: 'name',
            populate: {
                path: 'promotionId',
                select: 'name level academicYear'
            }
        });

        res.status(200).json({
            success: true,
            count: tus.length,
            data: tus,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get single TU
// @route   GET /api/tus/:id
// @access  Private/Admin
exports.getTU = async (req, res) => {
    try {
        const tu = await TU.findById(req.params.id).populate({
            path: 'semesterId',
            select: 'name',
            populate: {
                path: 'promotionId',
                select: 'name level academicYear'
            }
        });

        if (!tu) {
            return res.status(404).json({ success: false, message: 'TU not found' });
        }

        res.status(200).json({
            success: true,
            data: tu,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Create TU
// @route   POST /api/tus
// @access  Private/Admin
exports.createTU = async (req, res) => {
    try {
        const tu = await TU.create(req.body);

        res.status(201).json({
            success: true,
            data: tu,
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update TU
// @route   PUT /api/tus/:id
// @access  Private/Admin
exports.updateTU = async (req, res) => {
    try {
        const tu = await TU.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!tu) {
            return res.status(404).json({ success: false, message: 'TU not found' });
        }

        res.status(200).json({
            success: true,
            data: tu,
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete TU (Soft delete)
// @route   DELETE /api/tus/:id
// @access  Private/Admin
exports.deleteTU = async (req, res) => {
    try {
        const tu = await TU.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });

        if (!tu) {
            return res.status(404).json({ success: false, message: 'TU not found' });
        }

        res.status(200).json({
            success: true,
            data: {},
            message: 'TU deactivated'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
