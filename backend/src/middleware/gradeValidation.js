const Student = require('../models/Student');
const TUE = require('../models/TUE');

/**
 * Middleware to validate grade context and auto-derive academic year
 * This ensures grades are always saved with the correct academic year
 * matching the student's promotion
 */
exports.validateGradeContext = async (req, res, next) => {
    try {
        const { studentId, tueId } = req.body;

        if (!studentId || !tueId) {
            return res.status(400).json({
                success: false,
                message: 'Student ID and TUE ID are required'
            });
        }

        // 1. Get student with populated promotion
        const student = await Student.findById(studentId)
            .populate('promotionId');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        if (!student.promotionId) {
            return res.status(400).json({
                success: false,
                message: 'Student has no promotion assigned. Please assign the student to a promotion first.'
            });
        }

        // 2. Get TUE with full hierarchy
        const tue = await TUE.findById(tueId)
            .populate({
                path: 'tuId',
                populate: {
                    path: 'semesterId',
                    populate: 'promotionId'
                }
            });

        if (!tue) {
            return res.status(404).json({
                success: false,
                message: 'TUE (Teaching Unit Element) not found'
            });
        }

        // 3. Verify TUE belongs to student's promotion
        const tuePromotionId = tue.tuId?.semesterId?.promotionId?._id;
        const studentPromotionId = student.promotionId._id;

        if (!tuePromotionId) {
            return res.status(400).json({
                success: false,
                message: 'TUE has incomplete hierarchy (missing promotion link)'
            });
        }

        if (tuePromotionId.toString() !== studentPromotionId.toString()) {
            return res.status(400).json({
                success: false,
                message: `Cannot assign grade: Student is in "${student.promotionId.name}" but this TUE belongs to "${tue.tuId.semesterId.promotionId.name}"`
            });
        }

        // 4. Derive academic year from student's promotion
        const academicYear = student.promotionId.academicYear;

        if (!academicYear) {
            return res.status(400).json({
                success: false,
                message: `Promotion "${student.promotionId.name}" has no academic year defined. Please update the promotion.`
            });
        }

        // 5. Attach validated context to request
        req.gradeContext = {
            student,
            tue,
            academicYear,
            promotion: student.promotionId
        };

        // 6. Override any academicYear in request body with derived value
        req.body.academicYear = academicYear;

        next();

    } catch (error) {
        console.error('Grade validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating grade context: ' + error.message
        });
    }
};

/**
 * Middleware to validate bulk grade import context
 * Used for Excel imports where multiple grades are processed
 */
exports.validateBulkGradeContext = async (req, res, next) => {
    try {
        const { tueId } = req.params;

        if (!tueId) {
            return res.status(400).json({
                success: false,
                message: 'TUE ID is required'
            });
        }

        // Get TUE with full hierarchy
        const tue = await TUE.findById(tueId)
            .populate({
                path: 'tuId',
                populate: {
                    path: 'semesterId',
                    populate: 'promotionId'
                }
            });

        if (!tue) {
            return res.status(404).json({
                success: false,
                message: 'TUE not found'
            });
        }

        const promotion = tue.tuId?.semesterId?.promotionId;

        if (!promotion) {
            return res.status(400).json({
                success: false,
                message: 'TUE has incomplete hierarchy (missing promotion link)'
            });
        }

        const academicYear = promotion.academicYear;

        if (!academicYear) {
            return res.status(400).json({
                success: false,
                message: `Promotion "${promotion.name}" has no academic year defined`
            });
        }

        // Attach context to request
        req.bulkGradeContext = {
            tue,
            promotion,
            academicYear
        };

        // Override any academicYear in request body
        req.body.academicYear = academicYear;

        next();

    } catch (error) {
        console.error('Bulk grade validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating bulk grade context: ' + error.message
        });
    }
};
