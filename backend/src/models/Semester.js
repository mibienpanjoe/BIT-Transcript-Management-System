const mongoose = require('mongoose');

const SemesterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a semester name (e.g., S1, S2)'],
        trim: true,
    },
    promotionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Promotion',
        required: [true, 'Please assign a promotion'],
    },
    level: {
        type: String,
        enum: ['L1', 'L2', 'L3', 'M1', 'M2'],
        required: [true, 'Please specify the level'],
    },
    order: {
        type: Number,
        required: [true, 'Please specify semester order'],
        min: 1,
        max: 2,
    },
    isActive: {
        type: Boolean,
        default: true,
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

// Ensure unique semester per promotion and order
SemesterSchema.index({ promotionId: 1, order: 1 }, { unique: true });

// Auto-generate semester name based on level and order
SemesterSchema.pre('save', function (next) {
    const mapping = {
        'L1': { 1: 'S1', 2: 'S2' },
        'L2': { 1: 'S3', 2: 'S4' },
        'L3': { 1: 'S5', 2: 'S6' },
        'M1': { 1: 'M1S1', 2: 'M1S2' },
        'M2': { 1: 'M2S1', 2: 'M2S2' }
    };

    if (this.level && this.order) {
        this.name = mapping[this.level]?.[this.order] || `S${this.order}`;
    }
    next();
});

module.exports = mongoose.model('Semester', SemesterSchema);
