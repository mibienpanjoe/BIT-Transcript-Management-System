const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: [true, 'Please add a student ID (Matricule)'],
        unique: true,
        trim: true,
    },
    firstName: {
        type: String,
        required: [true, 'Please add a first name'],
        trim: true,
    },
    lastName: {
        type: String,
        required: [true, 'Please add a last name'],
        trim: true,
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Please add date of birth'],
    },
    placeOfBirth: {
        type: String,
        required: [true, 'Please add place of birth'],
    },
    fieldId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Field',
        required: [true, 'Please assign a field'],
    },
    promotionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Promotion',
        required: [true, 'Please assign a promotion'],
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

StudentSchema.virtual('registrationNumber').get(function () {
    return this.studentId;
});

StudentSchema.set('toJSON', { virtuals: true });
StudentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Student', StudentSchema);
