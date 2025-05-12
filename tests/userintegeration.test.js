const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/users');
require('dotenv').config();

let userId;

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION_STRING);
  await User.deleteMany({});
  const user = new User({
    name: 'Test User',
    email: 'testuser@example.com',
    phone: '123456789',
    passwordHash: 'hashedpassword',
    isAdmin: false
  });

  const savedUser = await user.save();
  userId = savedUser._id;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('User Routes Integration Testing', () => {

  it('should add a new user', async () => {
    const res = await request(app).post('/users/register').send({
      name: 'New User',
      email: 'newuser@example.com',
      phone: '987654321',
      password: 'newpassword',
      isAdmin: false
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email');
    expect(res.body.email).toBe('newuser@example.com');
  });

  it('should login an existing user', async () => {
    const res = await request(app).post('/users/login').send({
      email: 'newuser@example.com',
      password: 'newpassword'
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toBe('newuser@example.com');
  });

  it('should fetch all users', async () => {
    const res = await request(app).get('/users');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should fetch user by ID', async () => {
    const res = await request(app).get(`/users/${userId}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Test User');
  });

  it('should find user by name', async () => {
    const res = await request(app).get('/users/find/Test User');

    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Test User');
  });

  it('should delete user by ID', async () => {
    const res = await request(app).delete(`/users/${userId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should fetch the count of users', async () => {
    const res = await request(app).get('/users/get/count');

    expect(res.status).toBe(200);
    expect(res.body.userCount).toBeGreaterThanOrEqual(0);
  });


  it('should return 500 if required field is missing', async () => {
    const res = await request(app).post('/users/register').send({
      name: 'Incomplete User',
      email: 'incomplete@example.com',
      phone: '123123123'
      // missing password
    });

    expect(res.status).toBe(500); // or adjust if using a custom error handler
  });

  it('should return 400 for incorrect password', async () => {
    const res = await request(app).post('/users/login').send({
      email: 'newuser@example.com',
      password: 'wrongpassword'
    });

    expect(res.status).toBe(400);
    expect(res.text).toBe('password is wrong');
  });

  it('should return 400 when user is not found', async () => {
    const res = await request(app).post('/users/login').send({
      email: 'nonexistent@example.com',
      password: 'password'
    });

    expect(res.status).toBe(400);
    expect(res.text).toBe('user not found');
  });

  it('should return 505 if user is not found by ID', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/users/${fakeId}`);

    expect(res.status).toBe(505);
    expect(res.body.success).toBe(false);
  });

  it('should return 501 if user is not found by name', async () => {
    const res = await request(app).get('/users/find/NoSuchName');

    expect(res.status).toBe(501);
    expect(res.body.success).toBe(false);
  });


  it('should return 404 when trying to delete a non-existent user', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/users/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('user not found');
  });
  it('should return an empty array if no users exist', async () => {
    await User.deleteMany({});
    const res = await request(app).get('/users');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

});
