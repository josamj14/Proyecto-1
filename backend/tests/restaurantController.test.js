
jest.mock('../db/redisClient', () => ({
  client: {
    get: jest.fn(),
    set: jest.fn(),
    on: jest.fn(), 
  },
  getPrefixedKey: jest.fn((key) => `prefix:${key}`),
}));

const {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
} = require('../controllers/restaurantController');

const { getRepository } = require('../repositories/respositoryFactory');
const { client: redisClient, getPrefixedKey } = require('../db/redisClient');

jest.mock('../repositories/respositoryFactory');

describe('restaurantController', () => {
  let res, next, restRepo;

  beforeEach(() => {
    restRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    getRepository.mockReturnValue(restRepo);

    redisClient.get = jest.fn();
    redisClient.set = jest.fn();

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  test('createRestaurant - success', async () => {
    const req = { body: { name: 'Taco Place', address: '123 St' } };

    await createRestaurant(req, res, next);

    expect(restRepo.create).toHaveBeenCalledWith('Taco Place', '123 St');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: 201,
      message: 'Restaurant created successfully',
      data: null,
    });
  });

  test('getAllRestaurants - cache hit', async () => {
    const cachedData = [{ id: 1 }];
    redisClient.get.mockResolvedValue(JSON.stringify(cachedData));
    getPrefixedKey.mockReturnValue('prefix:all_restaurants');

    await getAllRestaurants({}, res, next);

    expect(redisClient.get).toHaveBeenCalledWith('prefix:all_restaurants');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'Restaurants fetched successfully (cache)',
      data: cachedData,
    });
  });

  test('getAllRestaurants - cache miss', async () => {
    redisClient.get.mockResolvedValue(null);
    const dbData = [{ id: 1, name: 'Pizza Place' }];
    restRepo.findAll.mockResolvedValue(dbData);
    getPrefixedKey.mockReturnValue('prefix:all_restaurants');

    await getAllRestaurants({}, res, next);

    expect(restRepo.findAll).toHaveBeenCalled();
    expect(redisClient.set).toHaveBeenCalledWith('prefix:all_restaurants', JSON.stringify(dbData), { EX: 3600 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'Restaurants fetched successfully',
      data: dbData,
    });
  });

  test('getRestaurantById - cache hit', async () => {
    const req = { params: { id: '1' } };
    const cached = { id: 1 };
    redisClient.get.mockResolvedValue(JSON.stringify(cached));
    getPrefixedKey.mockReturnValue('prefix:restaurant:1');

    await getRestaurantById(req, res, next);

    expect(redisClient.get).toHaveBeenCalledWith('prefix:restaurant:1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'Restaurant fetched successfully (cache)',
      data: cached,
    });
  });

  test('getRestaurantById - not found', async () => {
    const req = { params: { id: '999' } };
    redisClient.get.mockResolvedValue(null);
    restRepo.findById.mockResolvedValue(null);
    getPrefixedKey.mockReturnValue('prefix:restaurant:999');

    await getRestaurantById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      message: 'Restaurant not found',
      data: null,
    });
  });

  test('updateRestaurant - found', async () => {
    const req = {
      params: { id: '1' },
      body: { name: 'Updated', address: 'New Ave' },
    };
    const updated = { id: 1, name: 'Updated' };
    restRepo.update.mockResolvedValue(updated);

    await updateRestaurant(req, res, next);

    expect(restRepo.update).toHaveBeenCalledWith('1', 'Updated', 'New Ave');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'Restaurant updated successfully',
      data: updated,
    });
  });

  test('updateRestaurant - not found', async () => {
    const req = {
      params: { id: '999' },
      body: { name: 'None', address: 'Nowhere' },
    };
    restRepo.update.mockResolvedValue(null);

    await updateRestaurant(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      message: 'Restaurant not found',
      data: null,
    });
  });

  test('deleteRestaurant - success', async () => {
    const req = { params: { id: '1' } };
    restRepo.remove.mockResolvedValue(true);

    await deleteRestaurant(req, res, next);

    expect(restRepo.remove).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'Restaurant deleted successfully',
      data: null,
    });
  });

  test('deleteRestaurant - not found', async () => {
    const req = { params: { id: '999' } };
    restRepo.remove.mockResolvedValue(null);

    await deleteRestaurant(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      message: 'Restaurant not found',
      data: null,
    });
  });
});
