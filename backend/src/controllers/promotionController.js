const Promotion = require('../models/Promotion');

// @desc    Get all promotions
// @route   GET /api/promotions
// @access  Private/Admin
exports.getPromotions = async (req, res) => {
    try {
        const { fieldId, academicYear } = req.query;
        let query = { isActive: true };

        if (fieldId) query.fieldId = fieldId;
        if (academicYear) query.academicYear = academicYear;

        const promotions = await Promotion.find(query).populate('fieldId', 'name code');

        res.status(200).json({
            success: true,
            count: promotions.length,
            data: promotions,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get single promotion
// @route   GET /api/promotions/:id
// @access  Private/Admin
exports.getPromotion = async (req, res) => {
    try {
        const promotion = await Promotion.findById(req.params.id).populate('fieldId', 'name code');

        if (!promotion) {
            return res.status(404).json({ success: false, message: 'Promotion not found' });
        }

        res.status(200).json({
            success: true,
            data: promotion,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Create promotion
// @route   POST /api/promotions
// @access  Private/Admin
exports.createPromotion = async (req, res) => {
    try {
        const promotion = await Promotion.create(req.body);

        res.status(201).json({
            success: true,
            data: promotion,
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update promotion
// @route   PUT /api/promotions/:id
// @access  Private/Admin
exports.updatePromotion = async (req, res) => {
    try {
        const promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!promotion) {
            return res.status(404).json({ success: false, message: 'Promotion not found' });
        }

        res.status(200).json({
            success: true,
            data: promotion,
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete promotion (Soft delete)
// @route   DELETE /api/promotions/:id
// @access  Private/Admin
exports.deletePromotion = async (req, res) => {
    try {
        const promotion = await Promotion.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });

        if (!promotion) {
            return res.status(404).json({ success: false, message: 'Promotion not found' });
        }

        res.status(200).json({
            success: true,
            data: {},
            message: 'Promotion deactivated'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
