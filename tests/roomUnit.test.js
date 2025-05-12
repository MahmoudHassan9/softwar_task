const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Rooms = require("../models/Rooms");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Room Routes", () => {
  let roomId;

  // Test POST /rooms
  it("should create a new room", async () => {
    const res = await request(app)
      .post("/rooms/addRoom")
      .send({
        name: "Test Room",
        description: "A room for testing",
        price: 100,
        numberofmemebrs: 2,
        rating: 4.5,
      });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("room added successfully");
    expect(res.body.room).toHaveProperty("_id");
    roomId = res.body.room._id;
  });

  // Test GET /rooms
  it("should fetch all rooms", async () => {
    const res = await request(app).get("/rooms/getRooms");
    expect(res.status).toBe(200);
  });

  // Test GET /rooms/:id
  it("should fetch room by id", async () => {
    const res = await request(app).get(`/rooms/${roomId}`);
    expect(res.status).toBe(200);
    expect(res.body.room).toHaveProperty("name", "Test Room");
  });

  // Test GET /rooms/find/:name
  it("should fetch room by name", async () => {
    const res = await request(app).get("/rooms/find/Test Room");
    expect(res.status).toBe(200);
    expect(res.body.room).toHaveProperty("name", "Test Room");
  });

  // Test PUT /rooms/updateRoom/:id
  it("should update room", async () => {
    const res = await request(app)
      .put(`/rooms/updateRoom/${roomId}`)
      .send({
        price: 120,
        description: "Updated room description",
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("price", 120);
  });

  // Test DELETE /rooms/deleteRoom/:id
  it("should delete room", async () => {
    const res = await request(app).delete(`/rooms/deleteRoom/${roomId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("_id", roomId);
  });
});
