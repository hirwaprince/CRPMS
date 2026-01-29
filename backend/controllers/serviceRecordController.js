const ServiceRecord = require('../models/ServiceRecord');
const Car = require('../models/Car');
const Service = require('../models/Service');

// @desc    Create new service record
// @route   POST /api/service-records
const createServiceRecord = async (req, res) => {
    try {
        const { PlateNumber, ServiceCode, ServiceDate } = req.body;

        // Verify car exists
        const car = await Car.findOne({ PlateNumber: PlateNumber.toUpperCase() });
        if (!car) {
            return res.status(404).json({
                success: false,
                message: 'Car not found'
            });
        }

        // Verify service exists
        const service = await Service.findOne({ ServiceCode });
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        const serviceRecord = await ServiceRecord.create({
            PlateNumber: PlateNumber.toUpperCase(),
            ServiceCode,
            ServiceDate
        });

        // Return with additional info
        const responseData = {
            ...serviceRecord.toObject(),
            ServiceName: service.ServiceName,
            ServicePrice: service.ServicePrice,
            CarModel: car.Model
        };

        res.status(201).json({
            success: true,
            message: 'Service record created successfully',
            data: responseData
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// @desc    Get all service records
// @route   GET /api/service-records
const getServiceRecords = async (req, res) => {
    try {
        const records = await ServiceRecord.find({}).sort({ createdAt: -1 });

        // Enrich with car and service details
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

        res.json({
            success: true,
            count: enrichedRecords.length,
            data: enrichedRecords
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// @desc    Get unpaid service records
// @route   GET /api/service-records/unpaid
const getUnpaidRecords = async (req, res) => {
    try {
        const records = await ServiceRecord.find({ PaymentStatus: 'Pending' }).sort({ createdAt: -1 });

        // Enrich with car and service details
        const enrichedRecords = await Promise.all(
            records.map(async (record) => {
                const car = await Car.findOne({ PlateNumber: record.PlateNumber });
                const service = await Service.findOne({ ServiceCode: record.ServiceCode });
                
                return {
                    RecordNumber: record.RecordNumber,
                    PlateNumber: record.PlateNumber,
                    ServiceCode: record.ServiceCode,
                    ServiceDate: record.ServiceDate,
                    ServiceName: service?.ServiceName || 'Unknown',
                    ServicePrice: service?.ServicePrice || 0,
                    CarModel: car?.Model || 'Unknown'
                };
            })
        );

        res.json({
            success: true,
            count: enrichedRecords.length,
            data: enrichedRecords
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// @desc    Get single service record
// @route   GET /api/service-records/:id
const getServiceRecordById = async (req, res) => {
    try {
        const record = await ServiceRecord.findOne({ RecordNumber: parseInt(req.params.id) });

        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Service record not found'
            });
        }

        const car = await Car.findOne({ PlateNumber: record.PlateNumber });
        const service = await Service.findOne({ ServiceCode: record.ServiceCode });

        const enrichedRecord = {
            RecordNumber: record.RecordNumber,
            PlateNumber: record.PlateNumber,
            ServiceCode: record.ServiceCode,
            ServiceDate: record.ServiceDate,
            PaymentStatus: record.PaymentStatus,
            ServiceName: service?.ServiceName || 'Unknown',
            ServicePrice: service?.ServicePrice || 0,
            CarModel: car?.Model || 'Unknown',
            CarType: car?.type || 'Unknown',
            DriverPhone: car?.DriverPhone || 'Unknown',
            MechanicName: car?.MechanicName || 'Unknown'
        };

        res.json({
            success: true,
            data: enrichedRecord
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// @desc    Update service record
// @route   PUT /api/service-records/:id
const updateServiceRecord = async (req, res) => {
    try {
        const { PlateNumber, ServiceCode, ServiceDate } = req.body;

        const record = await ServiceRecord.findOne({ RecordNumber: parseInt(req.params.id) });

        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Service record not found'
            });
        }

        // Update fields
        record.PlateNumber = PlateNumber || record.PlateNumber;
        record.ServiceCode = ServiceCode || record.ServiceCode;
        record.ServiceDate = ServiceDate || record.ServiceDate;

        await record.save();

        res.json({
            success: true,
            message: 'Service record updated successfully',
            data: record
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// @desc    Delete service record
// @route   DELETE /api/service-records/:id
const deleteServiceRecord = async (req, res) => {
    try {
        const record = await ServiceRecord.findOne({ RecordNumber: parseInt(req.params.id) });

        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Service record not found'
            });
        }

        await ServiceRecord.deleteOne({ RecordNumber: parseInt(req.params.id) });

        res.json({
            success: true,
            message: 'Service record deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

module.exports = {
    createServiceRecord,
    getServiceRecords,
    getUnpaidRecords,
    getServiceRecordById,
    updateServiceRecord,
    deleteServiceRecord
};