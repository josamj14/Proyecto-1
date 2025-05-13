const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const restaurantRoutes = require('../../routes/restaurantRoutes');

// Mocks
jest.mock('../../repositories/respositoryFactory', () => ({
  getRepository: () => ({
    findAll: jest.fn().mockResolvedValue([{ restaurantId: 1, name: 'Mock Restaurant', address: '123 Ave' }]),
    findById: jest.fn().mockImplementation((id) =>
      id == 1
        ? Promise.resolve({ restaurantId: 1, name: 'Mock Restaurant', address: '123 Ave' })
        : Promise.resolve(null)
    ),
    create: jest.fn().mockResolvedValue(),
    update: jest.fn().mockResolvedValue(true),
    remove: jest.fn().mockResolvedValue(true),
  }),
}));

jest.mock('../../db/redisClient', () => ({
  client: {
    set: jest.fn(),
    get: jest.fn().mockResolvedValue(null),
    on: jest.fn(),
  },
  getPrefixedKey: (key) => `prefix:${key}`,
}));

// Setup Express app
const app = express();
app.use(bodyParser.json());
app.use('/api', restaurantRoutes);

describe('Restaurant Routes Integration', () => {
  test('GET /api/restaurant should return all restaurants', async () => {
    const res = await request(app).get('/api/restaurant');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/restaurant/:id should return a restaurant by ID', async () => {
    const res = await request(app).get('/api/restaurant/1');
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ restaurantId: 1 });
  });

  test('GET /api/restaurant/:id should return 404 for non-existing ID', async () => {
    const res = await request(app).get('/api/restaurant/999');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Restaurant not found');
  });

  test('POST /api/restaurant should create a new restaurant', async () => {
    const res = await request(app)
      .post('/api/restaurant')
      .send({ name: 'New Restaurant', address: 'Main Street 42' });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Restaurant created successfully');
  });

  test('PUT /api/restaurant/:id should update a restaurant', async () => {
    const res = await request(app)
      .put('/api/restaurant/1')
      .send({ name: 'Updated Restaurant', address: 'New Address 100' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Restaurant updated successfully');
  });

  test('DELETE /api/restaurant/:id should delete a restaurant', async () => {
    const res = await request(app).delete('/api/restaurant/1');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Restaurant deleted successfully');
  });
});
