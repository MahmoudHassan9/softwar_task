const request = require('supertest');
const app = require('../app'); 
const { performance } = require('perf_hooks');

describe('Performance Tests', () => {
  const maxResponseTime = 20000;

  it('GET /products - should respond under 20000ms', async () => {
    const start = performance.now();
    const res = await request(app).get('/rooms/getRooms');
    const end = performance.now();

    const responseTime = end - start;
    console.log(`GET /rooms took ${responseTime.toFixed(2)} ms`);

    expect(res.statusCode).toBe(200);
    expect(responseTime).toBeLessThan(maxResponseTime);
  },10500);

  it('GET /users - should respond under 20000ms', async () => {
    const start = performance.now();
    const res = await request(app).get('/users');
    const end = performance.now();

    const responseTime = end - start;
    console.log(`GET /users took ${responseTime.toFixed(2)} ms`);

    expect(res.statusCode).toBe(200);
    expect(responseTime).toBeLessThan(maxResponseTime);
  },10500);

  it('POST /users/register - should respond under 20000ms', async () => {
    const start = performance.now();
    const res = await request(app).post('/users/register').send({
      name: 'PerfTestUser',
      email: 'perf@example.com',
      password: '123456',
      phone: '1234567890'
    },10500);
    const end = performance.now();

    const responseTime = end - start;
    console.log(`POST /users/register took ${responseTime.toFixed(2)} ms`);

    expect(res.statusCode).toBe(200);
    expect(responseTime).toBeLessThan(maxResponseTime);
  });
});
