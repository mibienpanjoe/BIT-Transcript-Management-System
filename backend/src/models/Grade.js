const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'Please assign a student'],
    },
    tueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TUE',
        required: [true, 'Please assign a TUE'],
    },
    presence: {
        type: Number,
        min: 0,
        max: 20,
        default: 0,
    },
    participation: {
        type: Number,
        min: 0,
        max: 20,
        default: 10,
    },
    evaluation: {
        type: Number,
        min: 0,
        max: 20,
        default: 0,
    },
    finalGrade: {
        type: Number,
        min: 0,
        max: 20,
    },
    isValidated: {
        type: Boolean,
        default: false,
    },
    academicYear: {
        type: String,
        required: [true, 'Academic year is required'],
        validate: {
            validator: function (value) {
                // Validate format: "YYYY-YYYY"
                return /^\d{4}-\d{4}$/.test(value);
            },
            message: 'Academic year must be in format YYYY-YYYY (e.g., 2023-2024)'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Ensure unique grade per student, TUE, and academic year
GradeSchema.index({ studentId: 1, tueId: 1, academicYear: 1 }, { unique: true });

// Pre-save hook to verify academic year matches student's promotion
GradeSchema.pre('save', async function (next) {
    // Only validate on new documents or when academicYear is modified
    if (this.isNew || this.isModified('academicYear')) {
        try {
            const Student = require('./Student');
            const student = await Student.findById(this.studentId)
                .populate('promotionId');

            if (student && student.promotionId && student.promotionId.academicYear) {
                if (this.academicYear !== student.promotionId.academicYear) {
                    const error = new Error(
                        `Academic year mismatch: Grade has "${this.academicYear}" but student's promotion "${student.promotionId.name}" is for "${student.promotionId.academicYear}"`
                    );
                    error.name = 'ValidationError';
                    throw error;
                }
            }
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Calculate final grade before saving
GradeSchema.pre('save', function (next) {
    // Formula: (Presence * 5%) + (Participation * 5%) + (Evaluations * 90%)
    this.finalGrade = (this.presence * 0.05) + (this.participation * 0.05) + (this.evaluation * 0.90);
    // Round to 2 decimal places
    this.finalGrade = Math.round(this.finalGrade * 100) / 100;

    // Validation logic (simple check, full validation happens at TU level)
    this.isValidated = this.finalGrade >= 10; // Basic pass check for the element itself if needed, though TUEs don't usually have "validation" status separate from TU

    next();
});

// Trigger automatic cascade calculation after grade is saved
GradeSchema.post('save', async function (doc) {
    try {
        const autoCalcService = require('../services/autoCalculationService');
        await autoCalcService.onGradeChange(doc._id);
    } catch (error) {
        console.error('[Grade Hook] Auto-calculation error:', error);
        // Don't fail the save operation if calculation fails
    }
});

// Trigger automatic cascade calculation after grade is updated
GradeSchema.post('findOneAndUpdate', async function (doc) {
    if (doc) {
        try {
            const autoCalcService = require('../services/autoCalculationService');
            await autoCalcService.onGradeChange(doc._id);
        } catch (error) {
            console.error('[Grade Hook] Auto-calculation error:', error);
            // Don't fail the update operation if calculation fails
        }
    }
});

module.exports = mongoose.model('Grade', GradeSchema);
