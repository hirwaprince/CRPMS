const Service = require('../models/Service');

// @desc    Create new service
// @route   POST /api/services
const createService = async (req, res) => {
    try {
        const { ServiceName, ServicePrice } = req.body;

        const service = await Service.create({
            ServiceName,
            ServicePrice
        });

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: service
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// @desc    Get all services
// @route   GET /api/services
const getServices = async (req, res) => {
    try {
        const services = await Service.find({}).sort({ ServiceName: 1 });

        res.json({
            success: true,
            count: services.length,
            data: services
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// @desc    Get single service
// @route   GET /api/services/:id
const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        res.json({
            success: true,
            data: service
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

module.exports = {
    createService,
    getServices,
    getServiceById
};