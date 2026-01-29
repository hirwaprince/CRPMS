const Payment = require('../models/Payment');
const ServiceRecord = require('../models/ServiceRecord');
const Car = require('../models/Car');
const Service = require('../models/Service');

// @desc    Get daily report
// @route   GET /api/reports/daily
const getDailyReport = async (req, res) => {
    try {
        const { date } = req.query;
        
        const reportDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(reportDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(reportDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Get payments for the date
        const payments = await Payment.find({
            PaymentDate: { $gte: startOfDay, $lte: endOfDay }
        }).sort({ PaymentDate: 1 });

        // Build report data
        const reports = await Promise.all(
            payments.map(async (payment) => {
                const record = await ServiceRecord.findOne({ RecordNumber: payment.RecordNumber });
                const car = await Car.findOne({ PlateNumber: record?.PlateNumber });
                const service = await Service.findOne({ ServiceCode: record?.ServiceCode });

                return {
                    RecordNumber: payment.RecordNumber,
                    PlateNumber: record?.PlateNumber || 'Unknown',
                    CarModel: car?.Model || 'Unknown',
                    ServiceName: service?.ServiceName || 'Unknown',
                    ServicePrice: service?.ServicePrice || 0,
                    AmountPaid: payment.AmountPaid,
                    PaymentDate: payment.PaymentDate,
                    MechanicName: car?.MechanicName || 'Unknown'
                };
            })
        );

        // Calculate summary
        const summary = {
            totalServices: reports.length,
            totalServicePrice: reports.reduce((sum, r) => sum + r.ServicePrice, 0),
            totalAmountPaid: reports.reduce((sum, r) => sum + r.AmountPaid, 0)
        };

        res.json({
            success: true,
            data: {
                date: reportDate,
                reports,
                summary
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/reports/dashboard
const getDashboardStats = async (req, res) => {
    try {
        const totalCars = await Car.countDocuments();
        const totalServices = await Service.countDocuments();
        const totalRecords = await ServiceRecord.countDocuments();
        const pendingPayments = await ServiceRecord.countDocuments({ PaymentStatus: 'Pending' });
        
        const allPayments = await Payment.find({});
        const totalRevenue = allPayments.reduce((sum, p) => sum + p.AmountPaid, 0);

        // Today's stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayPayments = await Payment.find({
            PaymentDate: { $gte: today, $lt: tomorrow }
        });
        const todayRevenue = todayPayments.reduce((sum, p) => sum + p.AmountPaid, 0);

        res.json({
            success: true,
            data: {
                totalCars,
                totalServices,
                totalRecords,
                pendingPayments,
                totalRevenue,
                todayRevenue,
                todayTransactions: todayPayments.length
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

module.exports = {
    getDailyReport,
    getDashboardStats
};