const request = require('supertest');
const app = require('../app');

const User = require('../models/users');

describe('Password Hashing', () => {
  it('should store a hashed password', async () => {
    const rawPassword = 'TestPass123!';
    const res = await request(app).post('/users/register').send({
      name: 'HashUserf',
      email: `hashhh${Date.now()}@gmail.com`,
      password: rawPassword,
      phone: '1234567333'
    });

    const savedUser = await User.findOne({ email: res.body.email });
    expect(savedUser.passwordHash).not.toBe(rawPassword);
  });
});


  describe('Rate Limiting', () => {
    it('should block requests after exceeding the limit', async () => {
      for (let i = 0; i < 101; i++) {
        await request(app).get('/');
      }
  
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(429); 
    });
  });
  
