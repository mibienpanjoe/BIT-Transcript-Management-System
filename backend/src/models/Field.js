const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a field name'],
        unique: true,
        trim: true,
    },
    code: {
        type: String,
        required: [true, 'Please add a field code (e.g., CS, SE)'],
        unique: true,
        trim: true,
        uppercase: true,
    },
    description: {
        type: String,
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

module.exports = mongoose.model('Field', FieldSchema);
