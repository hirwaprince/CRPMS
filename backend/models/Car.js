const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    PlateNumber: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    type: {
        type: String,
        required: true
    },
    Model: {
        type: String,
        required: true
    },
    ManufacturingYear: {
        type: Number,
        required: true
    },
    DriverPhone: {
        type: String,
        required: true
    },
    MechanicName: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Car', carSchema);