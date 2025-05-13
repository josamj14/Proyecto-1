const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const menuRoutes = require('../../routes/menuRoutes');

// Mocks
jest.mock('../../repositories/respositoryFactory', () => ({
  getRepository: () => ({
    findAll: jest.fn().mockResolvedValue([{ menuId: 1, name: "Test Menu" }]),
    findById: jest.fn().mockImplementation((id) => id == 1
      ? Promise.resolve({ menuId: 1, name: "Test Menu" })
      : Promise.resolve(null)),
    create: jest.fn().mockResolvedValue(),
    update: jest.fn().mockResolvedValue(true),
    remove: jest.fn().mockResolvedValue(true),
  }),
}));

jest.mock('../../db/redisClient', () => ({
  client: {
    set: jest.fn(),
    get: jest.fn(),
    on: jest.fn()
  },
  getPrefixedKey: (key) => `prefix:${key}`,
}));

// App setup
const app = express();
app.use(bodyParser.json());
app.use('/api', menuRoutes);

describe('Menu Routes Integration', () => {
  test('GET /api/menus should return all menus', async () => {
    const res = await request(app).get('/api/menus');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/menus/:id should return a menu by ID', async () => {
    const res = await request(app).get('/api/menus/1');
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ menuId: 1, name: "Test Menu" });
  });

  test('GET /api/menus/:id should return 404 for non-existing ID', async () => {
    const res = await request(app).get('/api/menus/999');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Menu not found');
  });

  test('POST /api/menus should create a new menu', async () => {
    const res = await request(app)
      .post('/api/menus')
      .send({ name: 'New Menu' });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Menu created successfully');
  });

  test('PUT /api/menus/:id should update a menu', async () => {
    const res = await request(app)
      .put('/api/menus/1')
      .send({ name: 'Updated Menu' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Menu updated successfully');
  });

  test('DELETE /api/menus/:id should delete a menu', async () => {
    const res = await request(app).delete('/api/menus/1');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Menu deleted successfully');
  });
});
