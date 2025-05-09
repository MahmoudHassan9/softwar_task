const request = require('supertest');
const app = require('../app'); 
const mongoose = require('mongoose');
const Rooms = require('../models/Rooms');
require('dotenv').config();

let roomId;

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION_STRING);
  await Rooms.deleteMany({}); 
  const room = new Rooms({
    name: 'Deluxe Room',
    description: 'A beautiful room with sea view.',
    price: 200,
    numberofmemebrs: 2,
    rating: 4.8
  });

  const savedRoom = await room.save();
  roomId = savedRoom._id;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Room Routes Integration Testing', () => {
  

  it('should add a new room', async () => {
    const res = await request(app).post('/rooms').send({
      name: 'Standard Room',
      description: 'A simple room.',
      price: 100,
      numberofmemebrs: 2,
      rating: 3.5
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('room');
    expect(res.body.room.name).toBe('Standard Room');
  });

  
  it('should update an existing room', async () => {
    const res = await request(app).put(`/rooms/updateRoom/${roomId}`).send({
      name: 'Updated Deluxe Room',
      description: 'A newly renovated room with a garden view.',
      price: 250,
      numberofmemebrs: 3,
      rating: 4.9
    });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Deluxe Room');
    expect(res.body.price).toBe(250);
  });

  it('should fetch room by ID', async () => {
    const res = await request(app).get(`/rooms/${roomId}`);

    expect(res.status).toBe(200);
    expect(res.body.room._id).toBe(roomId.toString());
  });

  it('should find room by name', async () => {
    const res = await request(app).get('/rooms/find/Standard Room');

    expect(res.status).toBe(200);
    expect(res.body.room.name).toBe('Standard Room');
  });
  it('should delete a room', async () => {
    const res = await request(app).delete(`/rooms/deleteRoom/${roomId}`);

    expect(res.status).toBe(200);
    expect(res.body._id).toBe(roomId.toString());
  });

  it('should fetch all rooms', async () => {
    const res = await request(app).get('/rooms');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

 
});
