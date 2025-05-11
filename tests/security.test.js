const request = require('supertest');
const app = require('../app');

const User = require('../models/users');

describe('Password Hashing', () => {
  it('should store a hashed password', async () => {
    const rawPassword = 'TestPass123!';
    const res = await request(app).post('/users/register').send({
      name: 'HashUser',
      email: `hash${Date.now()}@mail.com`,
      password: rawPassword,
      phone: '1234567890'
    });

    const savedUser = await User.findOne({ email: res.body.email });
    expect(savedUser.passwordHash).not.toBe(rawPassword);
  });
});


describe('Security Headers', () => {
    it('should include security-related headers', async () => {
      const res = await request(app).get('/');
      
      expect(res.headers).toHaveProperty('x-dns-prefetch-control');
      expect(res.headers).toHaveProperty('x-frame-options', 'SAMEORIGIN');
      expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(res.headers).toHaveProperty('content-security-policy');
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
  
