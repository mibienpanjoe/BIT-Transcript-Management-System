const TUE = require('../models/TUE');
const Grade = require('../models/Grade');

const normalizeSchemaKey = (name, index) => {
    const base = String(name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    return `${base || 'evaluation'}-${index + 1}`;
};

const normalizeEvaluationSchema = (schema = []) => (
    schema.map((item, index) => ({
        key: item.key || normalizeSchemaKey(item.name, index),
        name: String(item.name || '').trim(),
        weight: Number(item.weight)
    }))
);

const validateEvaluationSchema = (schema = []) => {
    if (!Array.isArray(schema)) {
        return 'Evaluation schema must be an array';
    }

    if (schema.length === 0) {
        return 'Evaluation schema cannot be empty';
    }

    const keys = new Set();
    let totalWeight = 0;

    for (const item of schema) {
        if (!item.name) return 'Each evaluation must have a name';
        if (!item.key) return 'Each evaluation must have a key';
        if (keys.has(item.key)) return 'Evaluation keys must be unique';
        keys.add(item.key);

        if (Number.isNaN(item.weight)) return 'Each evaluation must have a valid weight';
        if (item.weight <= 0) return 'Evaluation weights must be greater than 0';

        totalWeight += item.weight;
    }

    if (Math.round(totalWeight * 100) / 100 !== 90) {
        return 'Evaluation weights must total 90';
    }

    return null;
};

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
        if (req.body.evaluationSchema) {
            const normalized = normalizeEvaluationSchema(req.body.evaluationSchema);
            const error = validateEvaluationSchema(normalized);
            if (error) {
                return res.status(400).json({ success: false, message: error });
            }
            req.body.evaluationSchema = normalized;
        }
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
        if (req.body.evaluationSchema) {
            const normalized = normalizeEvaluationSchema(req.body.evaluationSchema);
            const error = validateEvaluationSchema(normalized);
            if (error) {
                return res.status(400).json({ success: false, message: error });
            }
            req.body.evaluationSchema = normalized;
        }
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

// @desc    Get evaluation schema for a TUE
// @route   GET /api/tues/:id/evaluation-schema
// @access  Private/Teacher/Admin
exports.getEvaluationSchema = async (req, res) => {
    try {
        const tue = await TUE.findById(req.params.id);

        if (!tue) {
            return res.status(404).json({ success: false, message: 'TUE not found' });
        }

        const isAdmin = req.user.role === 'admin';
        if (!isAdmin && tue.teacherId?.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'You are not assigned to this TUE' });
        }

        const hasGrades = await Grade.exists({ tueId: tue._id });

        res.status(200).json({
            success: true,
            data: {
                evaluationSchema: tue.evaluationSchema || [],
                locked: !!hasGrades
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update evaluation schema for a TUE
// @route   PUT /api/tues/:id/evaluation-schema
// @access  Private/Teacher/Admin
exports.updateEvaluationSchema = async (req, res) => {
    try {
        const tue = await TUE.findById(req.params.id);

        if (!tue) {
            return res.status(404).json({ success: false, message: 'TUE not found' });
        }

        const isAdmin = req.user.role === 'admin';
        if (!isAdmin && tue.teacherId?.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'You are not assigned to this TUE' });
        }

        const normalized = normalizeEvaluationSchema(req.body.evaluationSchema || []);
        const error = validateEvaluationSchema(normalized);
        if (error) {
            return res.status(400).json({ success: false, message: error });
        }

        const hasGrades = await Grade.exists({ tueId: tue._id });
        if (hasGrades && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Evaluation schema is locked because grades already exist. Contact an administrator to update it.'
            });
        }

        tue.evaluationSchema = normalized;
        await tue.save();

        if (hasGrades) {
            const grades = await Grade.find({ tueId: tue._id });
            for (const grade of grades) {
                const existingMap = new Map(
                    (grade.evaluations || []).map((item) => [item.key, item])
                );

                grade.evaluations = normalized.map((schemaItem) => {
                    const existing = existingMap.get(schemaItem.key);
                    return {
                        key: schemaItem.key,
                        name: schemaItem.name,
                        weight: schemaItem.weight,
                        score: existing ? existing.score : null
                    };
                });

                grade.evaluation = 0;
                await grade.save();
            }
        }

        res.status(200).json({
            success: true,
            data: tue
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
