const TUE = require('../models/TUE');

// @desc    Get all TUEs
// @route   GET /api/tues
// @access  Private/Admin
exports.getTUEs = async (req, res) => {
    try {
        const { tuId } = req.query;
        let query = { isActive: true };

        if (tuId) query.tuId = tuId;

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
