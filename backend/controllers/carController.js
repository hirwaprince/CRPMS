const Car = require('../models/Car');

// @desc    Create new car
// @route   POST /api/cars
const createCar = async (req, res) => {
    try {
        const { PlateNumber, type, Model, ManufacturingYear, DriverPhone, MechanicName } = req.body;

        // Check if car exists
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

        res.status(201).json({
            success: true,
            message: 'Car registered successfully',
            data: car
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// @desc    Get all cars
// @route   GET /api/cars
const getCars = async (req, res) => {
    try {
        const cars = await Car.find({}).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: cars.length,
            data: cars
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// @desc    Get single car
// @route   GET /api/cars/:id
const getCarById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);

        if (!car) {
            return res.status(404).json({
                success: false,
                message: 'Car not found'
            });
        }

        res.json({
            success: true,
            data: car
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

module.exports = {
    createCar,
    getCars,
    getCarById
};