const express = require('express');
const Booking = require('../models/booking');
const Router = express.Router();
const BookingRoom = require('../models/booking-Room');
const mongoose = require('mongoose');
const sum = require('../util/sum');
const mul = require('../util/multibly');

// Get all bookings
Router.get('/allBookingRooms', async (req, res, next) => {

    const bookingList = await Booking.find()
        .populate('user', 'name')
        .populate({ path: 'bookingRooms', populate: 'room' })
        .sort({ 'dateBooked': -1 });

    if (!bookingList.length) {
        res.status(200).send([]);
    } else {
        res.status(200).send(bookingList);
    }

});

// Create a new booking
Router.post('/bookRoom', async (req, res, next) => {

    const booking = await Booking.findOne({
        user: req.body.user
    });

    if (!booking) {
        const bookingRoomsIds = await Promise.all(
            req.body.bookingRooms.map(async (bookingRoom) => {
                let newBookingRoom = new BookingRoom({
                    nights: bookingRoom.nights,
                    room: bookingRoom.room,
                    user: req.body.user
                });

                newBookingRoom = await newBookingRoom.save();
                return newBookingRoom._id;
            })
        );

        const totalPrices = await Promise.all(bookingRoomsIds.map(async (bookingRoomsId) => {
            const bookingRoom = await BookingRoom.findById(bookingRoomsId).populate('room', 'price');
            const totalPrice = mul(bookingRoom.room.price, bookingRoom.nights);
            return totalPrice;
        }));

        const totalPrice = sum(totalPrices);

        let newBooking = new Booking({
            bookingRooms: bookingRoomsIds,
            phone: req.body.phone,
            status: req.body.status,
            totalPrice: totalPrice,
            user: req.body.user,
        });

        newBooking = await newBooking.save();

        if (!newBooking) {
            return res.status(404).send('The Booking cannot be added');
        }

        res.status(201).send(newBooking);
    } else {
        const bookingRoomsIds = await Promise.all(
            req.body.bookingRooms.map(async (bookingRoom) => {
                let bookRoom = await BookingRoom.findOne({ room: bookingRoom.room, user: req.body.user });

                if (!bookRoom) {
                    let newbookingRoom = new BookingRoom({
                        nights: bookingRoom.nights,
                        room: bookingRoom.room,
                        user: req.body.user
                    });

                    newbookingRoom = await newbookingRoom.save();
                    return newbookingRoom._id.toString();
                } else {
                    bookRoom.nights += bookingRoom.nights;
                    await bookRoom.save();
                    return bookRoom._id.toString();
                }
            })
        );

        // Ensure bookingRooms is an array before calling .filter
        if (!Array.isArray(booking.bookingRooms)) {
            return res.status(400).send('Invalid bookingRooms format');
        }

        booking.bookingRooms = booking.bookingRooms.filter(item => !bookingRoomsIds.includes(item.toString()));
        booking.bookingRooms.push(...bookingRoomsIds);

        const totalPrices = await Promise.all(booking.bookingRooms.map(async (bookingRoomId) => {
            const bookingRoom = await BookingRoom.findById(bookingRoomId).populate('room', 'price');
            const totalPrice = mul(bookingRoom.room.price, bookingRoom.nights);
            return totalPrice;
        }));

        const totalPrice = sum(totalPrices);
        booking.totalPrice = totalPrice;

        await booking.save();
        res.status(201).send(booking);
    }

});

// Update booking status
Router.put('/:ID', async (req, res, next) => {

    const booking = await Booking.findByIdAndUpdate(req.params.ID, { status: req.body.status }, { new: true });
    if (!booking) {
        res.status(404).send('The Booking cannot be updated');
    } else {
        res.send(booking);
    }

});

// Get all bookings for a user
Router.get('/get/userBookings/:userId', async (req, res) => {

    const bookingList = await Booking.find({ user: req.params.userId })
        .populate('user', 'name')
        .populate({ path: 'bookingRooms', populate: 'room' })
        .sort({ 'dateBooked': -1 });

    if (!bookingList.length) {
        res.status(404).send('No bookings found');
    } else {
        res.status(200).send(bookingList);
    }

});

// Delete a booking
Router.delete('/', async (req, res, next) => {

    let booking = await Booking.findOne({ user: req.body.user });

    if (!booking) {
        return res.status(404).send('Booking not found');
    }

    const bookingRoomsIds = await Promise.all(
        req.body.bookingRooms.map(async (bookingRoom) => {
            let bookRoom = await BookingRoom.findOne({ room: bookingRoom.room, user: req.body.user });

            if (!bookRoom) {
                throw new Error("There is no Booking item");
            } else {
                bookRoom.nights -= bookingRoom.nights;
                await bookRoom.save();
                return bookRoom._id.toString();
            }
        })
    );

    // Ensure bookingRooms is an array before calling .filter
    if (!Array.isArray(booking.bookingRooms)) {
        return res.status(400).send('Invalid bookingRooms format');
    }

    // Remove booking rooms from booking
    booking.bookingRooms = booking.bookingRooms.filter(item => !bookingRoomsIds.includes(item.toString()));
    booking.bookingRooms.push(...bookingRoomsIds);

    // Recalculate total price
    const totalPrices = await Promise.all(booking.bookingRooms.map(async (bookingRoomId) => {
        const bookingRoom = await BookingRoom.findById(bookingRoomId).populate('room', 'price');
        const totalPrice = mul(bookingRoom.room.price, bookingRoom.nights);
        return totalPrice;
    }));

    const totalPrice = sum(totalPrices);
    booking.totalPrice = totalPrice;

    await booking.save();
    res.status(201).send(booking);

});

module.exports = Router;
