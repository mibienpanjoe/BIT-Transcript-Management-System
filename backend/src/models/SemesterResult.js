const mongoose = require('mongoose');

const SemesterResultSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    semesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Semester',
        required: true,
    },
    average: {
        type: Number,
        required: true,
    },
    totalCredits: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['VALIDATED', 'NOT VALIDATED', 'ADJOURNED'],
        required: true,
    },
    mention: {
        type: String,
        enum: ['F', 'D', 'D+', 'C', 'C+', 'B', 'B+', 'A', 'A+', 'A++'],
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

// Ensure unique result per student and semester
SemesterResultSchema.index({ studentId: 1, semesterId: 1 }, { unique: true });

module.exports = mongoose.model('SemesterResult', SemesterResultSchema);
