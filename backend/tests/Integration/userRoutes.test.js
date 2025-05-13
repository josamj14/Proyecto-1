const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('../../routes/userRoutes');

// Mock the user repository
jest.mock('../../repositories/respositoryFactory', () => ({
  getRepository: () => ({
    findAll: jest.fn().mockResolvedValue([{ userId: 1, name: 'Test User' }]),
    findById: jest.fn().mockImplementation((id) =>
      id == 1 ? Promise.resolve({ userId: 1, name: 'Test User' }) : Promise.resolve(null)
    ),
    create: jest.fn().mockResolvedValue({ userId: 2, name: 'New User' }),
    update: jest.fn().mockResolvedValue({ userId: 1, name: 'Updated User' }),
    remove: jest.fn().mockResolvedValue(true),
    login: jest.fn().mockImplementation((email) =>
      email === 'user@example.com'
        ? Promise.resolve({ userId: 1, name: 'Test User', email })
        : Promise.resolve(null)
    ),
  }),
}));

// Mock the Redis client
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
app.use('/api', userRoutes);

describe('User Routes Integration', () => {
  test('GET /api/user should return all users', async () => {
    const res = await request(app).get('/api/user');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(expect.any(Array));
  });

  test('GET /api/user/:id should return a user by ID', async () => {
    const res = await request(app).get('/api/user/1');
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ userId: 1, name: 'Test User' });
  });

  test('GET /api/user/:id should return 404 for non-existing user', async () => {
    const res = await request(app).get('/api/user/999');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('User not found');
  });

  test('POST /api/user should create a new user', async () => {
    const res = await request(app)
      .post('/api/user')
      .send({ role: 'admin', name: 'New User', email: 'new@example.com', password: '1234' });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('User created successfully');
  });

  test('PUT /api/user/:id should update a user', async () => {
    const res = await request(app)
      .put('/api/user/1')
      .send({ name: 'Updated User', email: 'updated@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User updated successfully');
  });

  test('DELETE /api/user/:id should delete a user', async () => {
    const res = await request(app).delete('/api/user/1');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User deleted successfully');
  });
});
