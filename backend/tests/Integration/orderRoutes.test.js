const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const orderRoutes = require('../../routes/orderRoutes');

// Mocks
jest.mock('../../repositories/respositoryFactory', () => ({
  getRepository: () => ({
    findAll: jest.fn().mockResolvedValue([{ orderId: 1, userId: 5, restaurantId: 2 }]),
    findById: jest.fn().mockImplementation((id) =>
      id == 1 ? Promise.resolve({ orderId: 1, userId: 5, restaurantId: 2 }) : Promise.resolve(null)
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
app.use('/api', orderRoutes);

describe('Order Routes Integration', () => {
  test('GET /api/orders should return all orders', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/orders/:id should return an order by ID', async () => {
    const res = await request(app).get('/api/orders/1');
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ orderId: 1 });
  });

  test('GET /api/orders/:id should return 404 for non-existing ID', async () => {
    const res = await request(app).get('/api/orders/999');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Order not found');
  });

  test('POST /api/orders should create a new order', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        userId: 5,
        datetime: '2025-03-17T12:30:00.000Z',
        restaurantId: 2,
      });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Order created successfully');
  });

  test('PUT /api/orders/:id should update an order', async () => {
    const res = await request(app)
      .put('/api/orders/1')
      .send({
        userId: 6,
        datetime: '2025-03-18T10:00:00.000Z',
        restaurantId: 3,
      });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Order updated successfully');
  });

  test('DELETE /api/orders/:id should delete an order', async () => {
    const res = await request(app).delete('/api/orders/1');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Order deleted successfully');
  });
});
