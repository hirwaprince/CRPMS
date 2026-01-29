const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    PaymentNumber: {
        type: Number,
        unique: true
    },
    RecordNumber: {
        type: Number,
        required: true
    },
    AmountPaid: {
        type: Number,
        required: true
    },
    PaymentDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    ReceivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Auto-generate PaymentNumber
paymentSchema.pre('save', async function(next) {
    if (!this.PaymentNumber) {
        const lastPayment = await mongoose.model('Payment')
            .findOne()
            .sort({ PaymentNumber: -1 });
        this.PaymentNumber = lastPayment ? lastPayment.PaymentNumber + 1 : 1;
    }
    next();
});

module.exports = mongoose.model('Payment', paymentSchema);