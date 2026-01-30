const mongoose = require('mongoose');

const TUESchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a TUE name'],
        trim: true,
    },
    code: {
        type: String,
        required: false, // Auto-generated if not provided
        trim: true,
        uppercase: true,
    },
    tuId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TU',
        required: [true, 'Please assign a TU'],
    },
    credits: {
        type: Number,
        required: [true, 'Please add credits'],
        min: 0,
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Optional - not all TUEs may have assigned teachers yet
    },
    volumeHours: {
        type: Number,
        required: false,
        min: 0,
        default: 0,
    },
    evaluationSchema: [
        {
            key: {
                type: String,
                required: true,
                trim: true
            },
            name: {
                type: String,
                required: true,
                trim: true
            },
            weight: {
                type: Number,
                required: true,
                min: 0,
                max: 90
            }
        }
    ],
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
TUESchema.pre('save', async function (next) {
    if (!this.code || this.isNew) {
        try {
            // Get TU and its related info
            const TU = mongoose.model('TU');
            const Semester = mongoose.model('Semester');
            const Promotion = mongoose.model('Promotion');
            const Field = mongoose.model('Field');

            const tu = await TU.findById(this.tuId);
            if (!tu) {
                return next(new Error('TU not found'));
            }

            const semester = await Semester.findById(tu.semesterId);
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

            // Generate abbreviation from TU name (first 3 letters, remove spaces)
            const tuNameClean = tu.name.replace(/[^a-zA-Z]/g, '');
            const abbreviation = tuNameClean.substring(0, 3).toUpperCase();

            // Count existing TUEs for this TU for sequence number
            const count = await mongoose.model('TUE').countDocuments({
                tuId: this.tuId,
                _id: { $ne: this._id } // Exclude current document if updating
            });

            // Generate code: EE_L3_REN401
            const fieldCode = field.code;
            const level = semester.level;
            const number = String(count + 401).padStart(3, '0'); // Start from 401

            this.code = `${fieldCode}_${level}_${abbreviation}${number}`;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Ensure unique TUE code per TU
TUESchema.index({ tuId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('TUE', TUESchema);
