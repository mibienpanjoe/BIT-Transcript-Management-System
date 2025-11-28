const TU = require('../models/TU');

// @desc    Get all TUs
// @route   GET /api/tus
// @access  Private/Admin
exports.getTUs = async (req, res) => {
    try {
        const { semesterId, promotionId, fieldId } = req.query;
        let query = { isActive: true };

        if (semesterId) {
            query.semesterId = semesterId;
        } else if (promotionId) {
            // Find Semesters for this promotion
            const Semester = require('../models/Semester');
            const semesters = await Semester.find({ promotionId, isActive: true }).select('_id');
            const semesterIds = semesters.map(s => s._id);
            query.semesterId = { $in: semesterIds };
        } else if (fieldId) {
            // Find Promotions for this field
            const Promotion = require('../models/Promotion');
            const promotions = await Promotion.find({ fieldId, isActive: true }).select('_id');
            const promotionIds = promotions.map(p => p._id);

            // Find Semesters for these promotions
            const Semester = require('../models/Semester');
            const semesters = await Semester.find({ promotionId: { $in: promotionIds }, isActive: true }).select('_id');
            const semesterIds = semesters.map(s => s._id);
            query.semesterId = { $in: semesterIds };
        }

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
