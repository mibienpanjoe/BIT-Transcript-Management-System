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
        required: [true, 'Please add academic year'],
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

// Ensure unique grade per student and TUE
GradeSchema.index({ studentId: 1, tueId: 1 }, { unique: true });

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

module.exports = mongoose.model('Grade', GradeSchema);
