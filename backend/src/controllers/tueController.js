const TUE = require('../models/TUE');

// @desc    Get all TUEs
// @route   GET /api/tues
// @access  Private/Admin/SchoolingManager
exports.getTUEs = async (req, res) => {
    try {
        const { tuId, semesterId, promotionId, fieldId } = req.query;
        let query = { isActive: true };

        if (tuId) {
            query.tuId = tuId;
        } else if (semesterId) {
            // Find TUs for this semester
            const TU = require('../models/TU');
            const tus = await TU.find({ semesterId, isActive: true }).select('_id');
            const tuIds = tus.map(tu => tu._id);
            query.tuId = { $in: tuIds };
        } else if (promotionId) {
            // Find Semesters for this promotion
            const Semester = require('../models/Semester');
            const semesters = await Semester.find({ promotionId, isActive: true }).select('_id');
            const semesterIds = semesters.map(s => s._id);

            // Find TUs for these semesters
            const TU = require('../models/TU');
            const tus = await TU.find({ semesterId: { $in: semesterIds }, isActive: true }).select('_id');
            const tuIds = tus.map(tu => tu._id);
            query.tuId = { $in: tuIds };
        } else if (fieldId) {
            // Find Promotions for this field
            const Promotion = require('../models/Promotion');
            const promotions = await Promotion.find({ fieldId, isActive: true }).select('_id');
            const promotionIds = promotions.map(p => p._id);

            // Find Semesters for these promotions
            const Semester = require('../models/Semester');
            const semesters = await Semester.find({ promotionId: { $in: promotionIds }, isActive: true }).select('_id');
            const semesterIds = semesters.map(s => s._id);

            // Find TUs for these semesters
            const TU = require('../models/TU');
            const tus = await TU.find({ semesterId: { $in: semesterIds }, isActive: true }).select('_id');
            const tuIds = tus.map(tu => tu._id);
            query.tuId = { $in: tuIds };
        }

        const tues = await TUE.find(query)
            .populate({
                path: 'tuId',
                select: 'name code',
                populate: {
                    path: 'semesterId',
                    select: 'name',
                    populate: {
                        path: 'promotionId',
                        select: 'name level academicYear'
                    }
                }
            })
            .populate({
                path: 'teacherId',
                select: 'firstName lastName email'
            });

        res.status(200).json({
            success: true,
            count: tues.length,
            data: tues,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get single TUE
// @route   GET /api/tues/:id
// @access  Private/Admin
exports.getTUE = async (req, res) => {
    try {
        const tue = await TUE.findById(req.params.id)
            .populate({
                path: 'tuId',
                select: 'name code',
                populate: {
                    path: 'semesterId',
                    select: 'name',
                    populate: {
                        path: 'promotionId',
                        select: 'name level academicYear'
                    }
                }
            })
            .populate({
                path: 'teacherId',
                select: 'firstName lastName email'
            });

        if (!tue) {
            return res.status(404).json({ success: false, message: 'TUE not found' });
        }

        res.status(200).json({
            success: true,
            data: tue,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Create TUE
// @route   POST /api/tues
// @access  Private/Admin
exports.createTUE = async (req, res) => {
    try {
        const tue = await TUE.create(req.body);

        res.status(201).json({
            success: true,
            data: tue,
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update TUE
// @route   PUT /api/tues/:id
// @access  Private/Admin
exports.updateTUE = async (req, res) => {
    try {
        const tue = await TUE.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!tue) {
            return res.status(404).json({ success: false, message: 'TUE not found' });
        }

        res.status(200).json({
            success: true,
            data: tue,
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete TUE (Soft delete)
// @route   DELETE /api/tues/:id
// @access  Private/Admin
exports.deleteTUE = async (req, res) => {
    try {
        const tue = await TUE.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });

        if (!tue) {
            return res.status(404).json({ success: false, message: 'TUE not found' });
        }

        res.status(200).json({
            success: true,
            data: {},
            message: 'TUE deactivated'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
