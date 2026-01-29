const mongoose = require('mongoose');

const serviceRecordSchema = new mongoose.Schema({
    RecordNumber: {
        type: Number,
        unique: true
    },
    PlateNumber: {
        type: String,
        required: true,
        uppercase: true
    },
    ServiceCode: {
        type: String,
        required: true
    },
    ServiceDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    PaymentStatus: {
        type: String,
        enum: ['Pending', 'Paid'],
        default: 'Pending'
    }
}, {
    timestamps: true
});

// Auto-generate RecordNumber
serviceRecordSchema.pre('save', async function(next) {
    if (!this.RecordNumber) {
        const lastRecord = await mongoose.model('ServiceRecord')
            .findOne()
            .sort({ RecordNumber: -1 });
        this.RecordNumber = lastRecord ? lastRecord.RecordNumber + 1 : 1;
    }
    next();
});

module.exports = mongoose.model('ServiceRecord', serviceRecordSchema);