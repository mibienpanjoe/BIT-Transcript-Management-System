const mongoose = require('mongoose');

const TUResultSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    tuId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TU',
        required: true,
    },
    average: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['V', 'NV', 'V-C'], // Validated, Not Validated, Validated by Compensation
        required: true,
    },
    creditsEarned: {
        type: Number,
        required: true,
    },
    academicYear: {
        type: String,
        required: true,
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

// Ensure unique result per student and TU
TUResultSchema.index({ studentId: 1, tuId: 1 }, { unique: true });

module.exports = mongoose.model('TUResult', TUResultSchema);
