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
        max: 6,
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

module.exports = mongoose.model('Semester', SemesterSchema);
