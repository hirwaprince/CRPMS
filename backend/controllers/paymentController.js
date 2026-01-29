const Payment = require('../models/Payment');
const ServiceRecord = require('../models/ServiceRecord');
const Car = require('../models/Car');
const Service = require('../models/Service');

// @desc    Create new payment
// @route   POST /api/payments
const createPayment = async (req, res) => {
    try {
        const { RecordNumber, AmountPaid, PaymentDate } = req.body;

        // Verify service record exists
        const record = await ServiceRecord.findOne({ RecordNumber });
        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Service record not found'
            });
        }

        // Check if already paid
        if (record.PaymentStatus === 'Paid') {
            return res.status(400).json({
                success: false,
                message: 'This service record is already paid'
            });
        }

        // Create payment
        const payment = await Payment.create({
            RecordNumber,
            AmountPaid,
            PaymentDate,
            ReceivedBy: req.user._id
        });

        // Update service record status
        record.PaymentStatus = 'Paid';
        await record.save();

        res.status(201).json({
            success: true,
            message: 'Payment recorded successfully',
            data: payment
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// @desc    Get all payments
// @route   GET /api/payments
const getPayments = async (req, res) => {
    try {
        const payments = await Payment.find({})
            .populate('ReceivedBy', 'fullName username')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// @desc    Get payment by record number (for bill)
// @route   GET /api/payments/record/:recordNumber
const getPaymentByRecord = async (req, res) => {
    try {
        const payment = await Payment.findOne({ 
            RecordNumber: parseInt(req.params.recordNumber) 
        }).populate('ReceivedBy', 'fullName username');

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Get service record details
        const record = await ServiceRecord.findOne({ RecordNumber: payment.RecordNumber });
        const car = await Car.findOne({ PlateNumber: record.PlateNumber });
        const service = await Service.findOne({ ServiceCode: record.ServiceCode });

        const billData = {
            PaymentNumber: payment.PaymentNumber,
            RecordNumber: payment.RecordNumber,
            AmountPaid: payment.AmountPaid,
            PaymentDate: payment.PaymentDate,
            PlateNumber: record.PlateNumber,
            CarType: car?.type,
            CarModel: car?.Model,
            ManufacturingYear: car?.ManufacturingYear,
            DriverPhone: car?.DriverPhone,
            MechanicName: car?.MechanicName,
            ServiceCode: record.ServiceCode,
            ServiceName: service?.ServiceName,
            ServicePrice: service?.ServicePrice,
            ServiceDate: record.ServiceDate,
            ReceivedBy: payment.ReceivedBy?.fullName || 'Unknown'
        };

        res.json({
            success: true,
            data: billData
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

module.exports = {
    createPayment,
    getPayments,
    getPaymentByRecord
};