const Semester = require('../models/Semester');

// @desc    Get all semesters
// @route   GET /api/semesters
// @access  Private/Admin
exports.getSemesters = async (req, res) => {
    try {
        const { promotionId, fieldId } = req.query;
        let query = { isActive: true };

        if (promotionId) {
            query.promotionId = promotionId;
        } else if (fieldId) {
            // Find Promotions for this field
            const Promotion = require('../models/Promotion');
            const promotions = await Promotion.find({ fieldId, isActive: true }).select('_id');
            const promotionIds = promotions.map(p => p._id);
            query.promotionId = { $in: promotionIds };
        }

        const semesters = await Semester.find(query).populate({
            path: 'promotionId',
            select: 'name level academicYear',
            populate: {
                path: 'fieldId',
                select: 'name code'
            }
        });

        res.status(200).json({
            success: true,
            count: semesters.length,
            data: semesters,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get single semester
// @route   GET /api/semesters/:id
// @access  Private/Admin
exports.getSemester = async (req, res) => {
    try {
        const semester = await Semester.findById(req.params.id).populate({
            path: 'promotionId',
            select: 'name level academicYear',
            populate: {
                path: 'fieldId',
                select: 'name code'
            }
        });

        if (!semester) {
            return res.status(404).json({ success: false, message: 'Semester not found' });
        }

        res.status(200).json({
            success: true,
            data: semester,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Create semester
// @route   POST /api/semesters
// @access  Private/Admin
exports.createSemester = async (req, res) => {
    try {
        const semester = await Semester.create(req.body);

        res.status(201).json({
            success: true,
            data: semester,
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update semester
// @route   PUT /api/semesters/:id
// @access  Private/Admin
exports.updateSemester = async (req, res) => {
    try {
        const semester = await Semester.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!semester) {
            return res.status(404).json({ success: false, message: 'Semester not found' });
        }

        res.status(200).json({
            success: true,
            data: semester,
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete semester (Soft delete)
// @route   DELETE /api/semesters/:id
// @access  Private/Admin
exports.deleteSemester = async (req, res) => {
    try {
        const semester = await Semester.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });

        if (!semester) {
            return res.status(404).json({ success: false, message: 'Semester not found' });
        }

        res.status(200).json({
            success: true,
            data: {},
            message: 'Semester deactivated'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
