const mongoose = require('mongoose');

const TUSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a TU name'],
        trim: true,
    },
    code: {
        type: String,
        required: false, // Auto-generated if not provided
        trim: true,
        uppercase: true,
    },
    semesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Semester',
        required: [true, 'Please assign a semester'],
    },
    credits: {
        type: Number,
        required: [true, 'Please add credits'],
        min: 0,
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

// Auto-generate code if not provided
TUSchema.pre('save', async function (next) {
    if (!this.code || this.isNew) {
        try {
            // Get semester info with populated relations
            const Semester = mongoose.model('Semester');
            const Promotion = mongoose.model('Promotion');
            const Field = mongoose.model('Field');

            const semester = await Semester.findById(this.semesterId);
            if (!semester) {
                return next(new Error('Semester not found'));
            }

            const promotion = await Promotion.findById(semester.promotionId);
            if (!promotion) {
                return next(new Error('Promotion not found'));
            }

            const field = await Field.findById(promotion.fieldId);
            if (!field) {
                return next(new Error('Field not found'));
            }

            // Count existing TUs in this semester for sequence number
            const count = await mongoose.model('TU').countDocuments({
                semesterId: this.semesterId,
                _id: { $ne: this._id } // Exclude current document if updating
            });

            // Generate code: TU_L3S1_EE_01
            const level = semester.level;
            const semesterOrder = `S${semester.order}`;
            const fieldCode = field.code;
            const number = String(count + 1).padStart(2, '0');

            this.code = `TU_${level}${semesterOrder}_${fieldCode}_${number}`;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Ensure unique TU code per semester
TUSchema.index({ semesterId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('TU', TUSchema);
