const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Service Schema
const serviceSchema = new mongoose.Schema({
    ServiceCode: { type: String, unique: true },
    ServiceName: { type: String, required: true },
    ServicePrice: { type: Number, required: true }
}, { timestamps: true });

const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);

// GET /api/services - Get all services
router.get('/', async (req, res) => {
    try {
        const services = await Service.find().sort({ ServiceName: 1 });
        res.json({ success: true, count: services.length, data: services });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/services - Create service
router.post('/', async (req, res) => {
    try {
        const { ServiceName, ServicePrice } = req.body;

        const count = await Service.countDocuments();
        const ServiceCode = `SRV${String(count + 1).padStart(3, '0')}`;

        const service = await Service.create({ ServiceCode, ServiceName, ServicePrice });

        res.status(201).json({ success: true, message: 'Service created', data: service });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/services/:id - Get single service
router.get('/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }
        res.json({ success: true, data: service });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;