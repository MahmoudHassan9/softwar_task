const mongoose = require('mongoose');

const roomBookingSchema = mongoose.Schema({
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rooms'
    },
    checkInDate: {
        type: Date
    },
    checkOutDate: {
        type: Date
    },
    nights: {
        type: Number,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }
});

module.exports = mongoose.model('BookingRoom', roomBookingSchema);
