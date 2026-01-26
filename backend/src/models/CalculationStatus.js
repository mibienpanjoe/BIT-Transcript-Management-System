const mongoose = require('mongoose');

const CalculationStatusSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    academicYear: {
        type: String,
        required: true,
    },
    semesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Semester',
        required: true,
    },

    // Progress tracking
    totalTUs: {
        type: Number,
        default: 0,
    },
    calculatedTUs: {
        type: Number,
        default: 0,
    },
    totalTUEs: {
        type: Number,
        default: 0,
    },
    gradedTUEs: {
        type: Number,
        default: 0,
    },

    // Missing data details
    missingGrades: [{
        tueId: mongoose.Schema.Types.ObjectId,
        tueName: String,
        components: [String] // ["presence", "evaluation"]
    }],

    incompleteTUs: [{
        tuId: mongoose.Schema.Types.ObjectId,
        tuName: String,
        missingTUEs: [String]
    }],

    // Status flags
    allGradesEntered: {
        type: Boolean,
        default: false,
    },
    allTUsCalculated: {
        type: Boolean,
        default: false,
    },
    semesterCalculated: {
        type: Boolean,
        default: false,
    },
    readyForTranscript: {
        type: Boolean,
        default: false,
    },

    // Completion percentage
    completionPercentage: {
        type: Number,
        default: 0,
    },

    // Timestamps
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
});

// Index for quick lookups
CalculationStatusSchema.index({ studentId: 1, academicYear: 1, semesterId: 1 });

module.exports = mongoose.model('CalculationStatus', CalculationStatusSchema);
