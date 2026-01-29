const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Schemas
const serviceRecordSchema = new mongoose.Schema({
    RecordNumber: { type: Number, unique: true },
    PlateNumber: { type: String, required: true, uppercase: true },
    ServiceCode: { type: String, required: true },
    ServiceDate: { type: Date, default: Date.now },
    PaymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' }
}, { timestamps: true });

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

const ServiceRecord = mongoose.models.ServiceRecord || mongoose.model('ServiceRecord', serviceRecordSchema);
const Car = mongoose.models.Car || mongoose.model('Car', carSchema);
const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);

// GET /api/service-records - Get all records
router.get('/', async (req, res) => {
    try {
        const records = await ServiceRecord.find().sort({ createdAt: -1 });

        const enrichedRecords = await Promise.all(
            records.map(async (record) => {
                const car = await Car.findOne({ PlateNumber: record.PlateNumber });
                const service = await Service.findOne({ ServiceCode: record.ServiceCode });

                return {
                    RecordNumber: record.RecordNumber,
                    PlateNumber: record.PlateNumber,
                    ServiceCode: record.ServiceCode,
                    ServiceDate: record.ServiceDate,
                    PaymentStatus: record.PaymentStatus,
                    ServiceName: service?.ServiceName || 'Unknown',
                    ServicePrice: service?.ServicePrice || 0,
                    CarModel: car?.Model || 'Unknown',
                    MechanicName: car?.MechanicName || 'Unknown'
                };
            })
        );

        res.json({ success: true, count: enrichedRecords.length, data: enrichedRecords });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/service-records/unpaid - Get unpaid records
router.get('/unpaid', async (req, res) => {
    try {
        const records = await ServiceRecord.find({ PaymentStatus: 'Pending' });

        const enrichedRecords = await Promise.all(
            records.map(async (record) => {
                const car = await Car.findOne({ PlateNumber: record.PlateNumber });
                const service = await Service.findOne({ ServiceCode: record.ServiceCode });

                return {
                    RecordNumber: record.RecordNumber,
                    PlateNumber: record.PlateNumber,
                    ServiceName: service?.ServiceName || 'Unknown',
                    ServicePrice: service?.ServicePrice || 0,
                    CarModel: car?.Model || 'Unknown'
                };
            })
        );

        res.json({ success: true, data: enrichedRecords });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/service-records/:id - Get single record
router.get('/:id', async (req, res) => {
    try {
        const record = await ServiceRecord.findOne({ RecordNumber: parseInt(req.params.id) });

        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }

        const car = await Car.findOne({ PlateNumber: record.PlateNumber });
        const service = await Service.findOne({ ServiceCode: record.ServiceCode });

        res.json({
            success: true,
            data: {
                RecordNumber: record.RecordNumber,
                PlateNumber: record.PlateNumber,
                ServiceCode: record.ServiceCode,
                ServiceDate: record.ServiceDate,
                PaymentStatus: record.PaymentStatus,
                ServiceName: service?.ServiceName,
                ServicePrice: service?.ServicePrice,
                CarModel: car?.Model,
                CarType: car?.type,
                DriverPhone: car?.DriverPhone,
                MechanicName: car?.MechanicName
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/service-records - Create record
router.post('/', async (req, res) => {
    try {
        const { PlateNumber, ServiceCode, ServiceDate } = req.body;

        console.log('Received:', { PlateNumber, ServiceCode, ServiceDate });

        // Validate
        if (!PlateNumber || !ServiceCode) {
            return res.status(400).json({
                success: false,
                message: 'PlateNumber and ServiceCode are required'
            });
        }

        // Auto-generate RecordNumber
        const lastRecord = await ServiceRecord.findOne().sort({ RecordNumber: -1 });
        const RecordNumber = lastRecord ? lastRecord.RecordNumber + 1 : 1;

        const record = await ServiceRecord.create({
            RecordNumber,
            PlateNumber: PlateNumber.toUpperCase(),
            ServiceCode: ServiceCode,  // Keep as string
            ServiceDate: ServiceDate || new Date()
        });

        res.status(201).json({ success: true, message: 'Record created', data: record });
    } catch (error) {
        console.error('Create error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});


// PUT /api/service-records/:id - Update record
router.put('/:id', async (req, res) => {
    try {
        const { PlateNumber, ServiceCode, ServiceDate } = req.body;

        const record = await ServiceRecord.findOneAndUpdate(
            { RecordNumber: parseInt(req.params.id) },
            { PlateNumber: PlateNumber?.toUpperCase(), ServiceCode, ServiceDate },
            { new: true }
        );

        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }

        res.json({ success: true, message: 'Record updated', data: record });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/service-records/:id - Delete record
router.delete('/:id', async (req, res) => {
    try {
        const record = await ServiceRecord.findOneAndDelete({ RecordNumber: parseInt(req.params.id) });

        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }

        res.json({ success: true, message: 'Record deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;