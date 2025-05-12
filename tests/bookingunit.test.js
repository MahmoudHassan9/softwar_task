const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const Booking = require("../models/booking").Booking;
const BookingRoom = require("../models/booking-Room").BookingRoom;
const Room = require("../models/Rooms");
const User = require("../models/users");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("POST /bookings", () => {
  it("should create a new booking", async () => {
    const user = await User.create({ name: "test", email: "test@test.com", passwordHash: "hashed", phone: "65462309" });
    const room = await Room.create({ name: "Room 1", price: 100, description: "good" });

    const res = await request(app)
      .post("/bookings/bookRoom")
      .send({
        bookingRooms: [
          {
            room: room._id,
            nights: 2,
            user: user._id
          }
        ],
        phone: '01020202020',
        status: 'Pending',
        user: user._id
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.totalPrice).toBe(200);
  });
});
