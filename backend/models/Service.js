const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    ServiceCode: {
        type: String,
        required: true,
        unique: true
    },
    ServiceName: {
        type: String,
        required: true
    },
    ServicePrice: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Service', serviceSchema);