const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Booking = require('../models/booking');
const BookingRoom = require('../models/booking-Room');
const User = require('../models/users');
const Rooms = require('../models/Rooms');

require('dotenv').config();

let user;
let room;
let booking;

beforeAll(async () => {
    await mongoose.connect(process.env.CONNECTION_STRING);
    await User.deleteMany({});
    await Rooms.deleteMany({});
    await BookingRoom.deleteMany({});
    await Booking.deleteMany({});

    user = await User.create({
        name: 'Test User',
        email: 'testuser@example.com',
        passwordHash: 'hashedpw',
        phone: '01010101010'
    });

    room = await Rooms.create({
        name: 'Test Room',
        description: 'Test Room Description',
        price: 150,
        numberofmemebrs: 2,
        rating: 4.5
    });

    booking = await Booking.create({
        bookingRooms: [],
        phone: '01010101010',
        totalPrice: 300,
        user: user._id,
        status: 'Pending'
    });
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Booking Routes Integration Testing', () => {

    it('should create a new booking', async () => {
        const res = await request(app).post('/bookings/bookRoom').send({
            bookingRooms: [
                {
                    room: room._id,
                    nights: 2,
                    user: user._id
                }
            ],
            phone: '01065618744',
            status: 'Pending',
            user: user._id
        });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.totalPrice).toBe(300);
    });

    it('should fetch all bookings', async () => {
        const res = await request(app).get('/bookings/allBookingRooms');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('should update booking status', async () => {
        const res = await request(app).put(`/bookings/${booking._id}`).send({
            status: 'Completed'
        });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('Completed');
    });

    it('should fetch bookings by user', async () => {
        const res = await request(app).get(`/bookings/get/userBookings/${user._id}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('should delete booking room from booking', async () => {
        const res = await request(app).delete('/bookings').send({
            user: user._id,
            bookingRooms: [
                {
                    room: room._id,
                    nights: 1
                }
            ]
        });

        expect(res.status).toBe(201);
        expect(res.body.totalPrice).toBe(150); // Price after removing 1 night
    });


    it('should return 404 when trying to update a non-existent booking', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app).put(`/bookings/${fakeId}`).send({ status: 'Cancelled' });

        expect(res.status).toBe(404);
    });

    it('should return 404 if user has no bookings', async () => {
        await Booking.deleteMany({ user: user._id });
        const res = await request(app).get(`/bookings/get/userBookings/${user._id}`);

        expect(res.status).toBe(404);
        expect(res.text).toBe('No bookings found');
    });


    it('should update existing booking if one already exists for user', async () => {
        // Add a room again to the existing booking
        const res = await request(app).post('/bookings/bookRoom').send({
            bookingRooms: [
                {
                    room: room._id,
                    nights: 1,
                    user: user._id
                }
            ],
            phone: '01065618744',
            status: 'Pending',
            user: user._id
        });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.bookingRooms.length).toBeGreaterThan(0);
    });

    it('should return 404 when deleting a booking that does not exist', async () => {
        const fakeUser = await User.create({
            name: 'Another User',
            email: 'another@example.com',
            passwordHash: '123',
            phone: '999999999'
        });

        const res = await request(app).delete('/bookings').send({
            user: fakeUser._id,
            bookingRooms: [{ room: room._id, nights: 1 }]
        });

        expect(res.status).toBe(404);
        expect(res.text).toBe('Booking not found');
    });



});
