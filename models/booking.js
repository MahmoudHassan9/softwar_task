const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
    bookingRooms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookingRoom',  
        required: true
    }],
    phone: {
        type: String,
        required: true
    },
    totalPrice: {
        type: Number
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
    },
    dateBooked: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
        default: 'Pending'
    },
});


module.exports = mongoose.model('Booking', bookingSchema);
