const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const reservationRoutes = require('../../routes/reservationRoutes');

// Mocks
jest.mock('../../repositories/respositoryFactory', () => ({
  getRepository: () => ({
    findAll: jest.fn().mockResolvedValue([{ reservationId: 1, userId: 10, tableId: 3 }]),
    findById: jest.fn().mockImplementation((id) =>
      id == 1
        ? Promise.resolve({ reservationId: 1, userId: 10, tableId: 3 })
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
app.use('/api', reservationRoutes);

describe('Reservation Routes Integration', () => {
  test('GET /api/reservations should return all reservations', async () => {
    const res = await request(app).get('/api/reservations');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/reservations/:id should return a reservation by ID', async () => {
    const res = await request(app).get('/api/reservations/1');
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ reservationId: 1 });
  });

  test('GET /api/reservations/:id should return 404 for non-existing ID', async () => {
    const res = await request(app).get('/api/reservations/999');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Reservation not found');
  });

  test('POST /api/reservations should create a new reservation', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .send({
        userId: 10,
        datetime: '2025-06-01T18:00:00.000Z',
        capacity: 4,
        tableId: 3,
        restaurantId: 2,
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Reservation created successfully');
  });

  test('PUT /api/reservations/:id should update a reservation', async () => {
    const res = await request(app)
      .put('/api/reservations/1')
      .send({
        userId: 10,
        datetime: '2025-06-02T19:00:00.000Z',
        capacity: 6,
        tableId: 4,
        restaurantId: 2,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Reservation updated successfully');
  });

  test('DELETE /api/reservations/:id should delete a reservation', async () => {
    const res = await request(app).delete('/api/reservations/1');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Reservation deleted successfully');
  });
});
