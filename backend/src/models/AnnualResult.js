const mongoose = require('mongoose');

const AnnualResultSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    academicYear: {
        type: String,
        required: true,
    },
    level: {
        type: String,
        enum: ['L1', 'L2', 'L3', 'M1', 'M2'],
        required: true,
    },

    // Semester 1 data
    semester1: {
        semesterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Semester',
            required: true,
        },
        name: String,
        average: Number,
        credits: Number,
        status: String,
        mention: String,
        resultId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SemesterResult',
        },
    },

    // Semester 2 data
    semester2: {
        semesterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Semester',
            required: true,
        },
        name: String,
        average: Number,
        credits: Number,
        status: String,
        mention: String,
        resultId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SemesterResult',
        },
    },

    // Annual calculations
    annualAverage: {
        type: Number,
        required: true,
    },
    totalCredits: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['VALIDATED', 'NOT VALIDATED', 'INCOMPLETE'],
        required: true,
    },
    mention: {
        type: String,
        enum: ['F', 'D', 'D+', 'C', 'C+', 'B', 'B+', 'A', 'A+', 'A++'],
        required: true,
    },

    // Validation flags
    meetsMinimumCredits: {
        type: Boolean,
        required: true,
    },
    bothSemestersValidated: {
        type: Boolean,
        required: true,
    },
    isComplete: {
        type: Boolean,
        default: true,
    },

    // Missing data tracking
    missingData: [{
        type: {
            type: String,
        },
        semesterId: mongoose.Schema.Types.ObjectId,
        description: String,
    }],

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    completedAt: {
        type: Date,
        default: Date.now,
    },
});

// Ensure unique annual result per student and year
AnnualResultSchema.index({ studentId: 1, academicYear: 1, level: 1 }, { unique: true });

module.exports = mongoose.model('AnnualResult', AnnualResultSchema);
