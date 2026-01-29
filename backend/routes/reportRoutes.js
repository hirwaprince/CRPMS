const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Schemas
const paymentSchema = new mongoose.Schema({
    PaymentNumber: Number,
    RecordNumber: Number,
    AmountPaid: Number,
    PaymentDate: Date
});

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
    ManufacturingYear: Number,
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

// GET /api/reports/dashboard - Dashboard statistics
router.get('/dashboard', async (req, res) => {
    try {
        // Get counts
        const totalCars = await Car.countDocuments();
        const totalServices = await Service.countDocuments();
        const totalRecords = await ServiceRecord.countDocuments();
        const pendingPayments = await ServiceRecord.countDocuments({ PaymentStatus: 'Pending' });
        const completedPayments = await ServiceRecord.countDocuments({ PaymentStatus: 'Paid' });

        // Get total revenue
        const allPayments = await Payment.find();
        const totalRevenue = allPayments.reduce((sum, p) => sum + (p.AmountPaid || 0), 0);

        // Get today's stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayPayments = await Payment.find({
            PaymentDate: { $gte: today, $lt: tomorrow }
        });
        const todayRevenue = todayPayments.reduce((sum, p) => sum + (p.AmountPaid || 0), 0);
        const todayTransactions = todayPayments.length;

        // Get recent service records (last 5)
        const recentRecords = await ServiceRecord.find()
            .sort({ createdAt: -1 })
            .limit(5);

        // Enrich recent records with car and service details
        const enrichedRecentRecords = await Promise.all(
            recentRecords.map(async (record) => {
                const car = await Car.findOne({ PlateNumber: record.PlateNumber });
                const service = await Service.findOne({ ServiceCode: record.ServiceCode });

                return {
                    RecordNumber: record.RecordNumber,
                    PlateNumber: record.PlateNumber,
                    CarModel: car?.Model || 'Unknown',
                    ServiceName: service?.ServiceName || 'Unknown',
                    ServicePrice: service?.ServicePrice || 0,
                    ServiceDate: record.ServiceDate,
                    PaymentStatus: record.PaymentStatus || 'Pending'
                };
            })
        );

        // Get recent payments (last 5)
        const recentPayments = await Payment.find()
            .sort({ createdAt: -1 })
            .limit(5);

        const enrichedRecentPayments = await Promise.all(
            recentPayments.map(async (payment) => {
                const record = await ServiceRecord.findOne({ RecordNumber: payment.RecordNumber });
                const car = await Car.findOne({ PlateNumber: record?.PlateNumber });
                const service = await Service.findOne({ ServiceCode: record?.ServiceCode });

                return {
                    PaymentNumber: payment.PaymentNumber,
                    RecordNumber: payment.RecordNumber,
                    PlateNumber: car?.PlateNumber || 'Unknown',
                    CarModel: car?.Model || 'Unknown',
                    ServiceName: service?.ServiceName || 'Unknown',
                    AmountPaid: payment.AmountPaid,
                    PaymentDate: payment.PaymentDate
                };
            })
        );

        res.json({
            success: true,
            data: {
                counts: {
                    totalCars,
                    totalServices,
                    totalRecords,
                    pendingPayments,
                    completedPayments
                },
                revenue: {
                    total: totalRevenue,
                    today: todayRevenue,
                    currency: 'RWF'
                },
                today: {
                    transactions: todayTransactions,
                    revenue: todayRevenue
                },
                recentRecords: enrichedRecentRecords,
                recentPayments: enrichedRecentPayments
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/reports/daily - Daily report
router.get('/daily', async (req, res) => {
    try {
        const { date } = req.query;

        const reportDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(reportDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(reportDate);
        endOfDay.setHours(23, 59, 59, 999);

        const payments = await Payment.find({
            PaymentDate: { $gte: startOfDay, $lte: endOfDay }
        });

        const reports = await Promise.all(
            payments.map(async (payment) => {
                const record = await ServiceRecord.findOne({ RecordNumber: payment.RecordNumber });
                const car = await Car.findOne({ PlateNumber: record?.PlateNumber });
                const service = await Service.findOne({ ServiceCode: record?.ServiceCode });

                return {
                    RecordNumber: payment.RecordNumber,
                    PlateNumber: car?.PlateNumber || 'Unknown',
                    CarModel: car?.Model || 'Unknown',
                    ServiceName: service?.ServiceName || 'Unknown',
                    ServicePrice: service?.ServicePrice || 0,
                    AmountPaid: payment.AmountPaid,
                    PaymentDate: payment.PaymentDate,
                    MechanicName: car?.MechanicName || 'Unknown'
                };
            })
        );

        const summary = {
            totalServices: reports.length,
            totalServicePrice: reports.reduce((sum, r) => sum + r.ServicePrice, 0),
            totalAmountPaid: reports.reduce((sum, r) => sum + r.AmountPaid, 0)
        };

        res.json({ success: true, data: { date: reportDate, reports, summary } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;