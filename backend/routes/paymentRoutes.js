const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Schemas
const paymentSchema = new mongoose.Schema({
    PaymentNumber: { type: Number, unique: true },
    RecordNumber: { type: Number, required: true },
    AmountPaid: { type: Number, required: true },
    PaymentDate: { type: Date, default: Date.now }
}, { timestamps: true });

const serviceRecordSchema = new mongoose.Schema({
    RecordNumber: Number,
    PlateNumber: String,
    ServiceCode: String,
    ServiceDate: Date,
    PaymentStatus: String
});

const carSchema = new mongoose.Schema({
    PlateNumber: String,
    type: String,
    Model: String,
    DriverPhone: String,
    MechanicName: String
});

const serviceSchema = new mongoose.Schema({
    ServiceCode: String,
    ServiceName: String,
    ServicePrice: Number
});

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
const ServiceRecord = mongoose.models.ServiceRecord || mongoose.model('ServiceRecord', serviceRecordSchema);
const Car = mongoose.models.Car || mongoose.model('Car', carSchema);
const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);

// GET /api/payments - Get all payments
router.get('/', async (req, res) => {
    try {
        const payments = await Payment.find().sort({ createdAt: -1 });
        res.json({ success: true, data: payments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/payments/record/:recordNumber - Get payment for bill
router.get('/record/:recordNumber', async (req, res) => {
    try {
        const payment = await Payment.findOne({ RecordNumber: parseInt(req.params.recordNumber) });

        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        const record = await ServiceRecord.findOne({ RecordNumber: payment.RecordNumber });
        const car = await Car.findOne({ PlateNumber: record?.PlateNumber });
        const service = await Service.findOne({ ServiceCode: record?.ServiceCode });

        res.json({
            success: true,
            data: {
                PaymentNumber: payment.PaymentNumber,
                RecordNumber: payment.RecordNumber,
                AmountPaid: payment.AmountPaid,
                PaymentDate: payment.PaymentDate,
                PlateNumber: car?.PlateNumber,
                CarType: car?.type,
                CarModel: car?.Model,
                DriverPhone: car?.DriverPhone,
                MechanicName: car?.MechanicName,
                ServiceName: service?.ServiceName,
                ServicePrice: service?.ServicePrice,
                ServiceDate: record?.ServiceDate
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/payments - Create payment
router.post('/', async (req, res) => {
    try {
        const { RecordNumber, AmountPaid, PaymentDate } = req.body;

        const record = await ServiceRecord.findOne({ RecordNumber });
        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }

        if (record.PaymentStatus === 'Paid') {
            return res.status(400).json({ success: false, message: 'Already paid' });
        }

        // Auto-generate PaymentNumber
        const lastPayment = await Payment.findOne().sort({ PaymentNumber: -1 });
        const PaymentNumber = lastPayment ? lastPayment.PaymentNumber + 1 : 1;

        const payment = await Payment.create({
            PaymentNumber,
            RecordNumber,
            AmountPaid,
            PaymentDate
        });

        // Update record status
        await ServiceRecord.findOneAndUpdate(
            { RecordNumber },
            { PaymentStatus: 'Paid' }
        );

        res.status(201).json({ success: true, message: 'Payment recorded', data: payment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;