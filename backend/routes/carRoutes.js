const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Car Schema - NO unique index on PlateNumber at schema level
const carSchema = new mongoose.Schema({
    PlateNumber: { type: String, required: true, uppercase: true },
    type: { type: String, required: true },
    Model: { type: String, required: true },
    ManufacturingYear: { type: Number, required: true },
    DriverPhone: { type: String, required: true },
    MechanicName: { type: String, required: true }
}, { timestamps: true });

// Only create model if it doesn't exist
const Car = mongoose.models.Car || mongoose.model('Car', carSchema);

// GET /api/cars - Get all cars
router.get('/', async (req, res) => {
    try {
        const cars = await Car.find().sort({ createdAt: -1 });
        res.json({ success: true, count: cars.length, data: cars });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/cars - Create car
router.post('/', async (req, res) => {
    try {
        const { PlateNumber, type, Model, ManufacturingYear, DriverPhone, MechanicName } = req.body;

        // Check if car already exists manually
        const existingCar = await Car.findOne({ PlateNumber: PlateNumber.toUpperCase() });
        if (existingCar) {
            return res.status(400).json({ 
                success: false, 
                message: 'Car with this plate number already exists' 
            });
        }

        const car = await Car.create({
            PlateNumber: PlateNumber.toUpperCase(),
            type,
            Model,
            ManufacturingYear,
            DriverPhone,
            MechanicName
        });

        res.status(201).json({ success: true, message: 'Car registered', data: car });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/cars/:id - Get single car
router.get('/:id', async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ success: false, message: 'Car not found' });
        }
        res.json({ success: true, data: car });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;