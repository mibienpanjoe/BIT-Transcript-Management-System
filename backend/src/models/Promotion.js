const mongoose = require('mongoose');

const PromotionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a promotion name'],
        trim: true,
    },
    fieldId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Field',
        required: [true, 'Please assign a field'],
    },
    level: {
        type: String,
        enum: ['L1', 'L2', 'L3', 'M1', 'M2'],
        required: [true, 'Please specify the level'],
    },
    academicYear: {
        type: String,
        required: [true, 'Please add academic year'],
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

// Ensure unique promotion per field and year
PromotionSchema.index({ fieldId: 1, level: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Promotion', PromotionSchema);
