
jest.mock('../../db/redisClient', () => ({
  client: {
    get: jest.fn(),
    set: jest.fn(),
    on: jest.fn(), 
  },
  getPrefixedKey: jest.fn((key) => `prefix:${key}`),
}));

const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} = require('../../controllers/orderController');

const { getRepository } = require('../../repositories/respositoryFactory');
const { client: redisClient, getPrefixedKey } = require('../../db/redisClient');

jest.mock('../../repositories/respositoryFactory');

describe('orderController', () => {
  let res, next, ordRepo;

  beforeEach(() => {
    ordRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    getRepository.mockReturnValue(ordRepo);

    redisClient.get = jest.fn();
    redisClient.set = jest.fn();

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  test('createOrder - success', async () => {
    const req = { body: { userId: 1, datetime: '2025-05-12', restaurantId: 2 } };

    await createOrder(req, res, next);

    expect(ordRepo.create).toHaveBeenCalledWith(1, '2025-05-12', 2);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: 201,
      message: 'Order created successfully',
      data: null,
    });
  });

  test('getAllOrders - cache hit', async () => {
    const cachedOrders = [{ id: 1, userId: 1 }];
    redisClient.get.mockResolvedValue(JSON.stringify(cachedOrders));

    getPrefixedKey.mockReturnValue('prefix:all_orders');

    await getAllOrders({}, res, next);

    expect(redisClient.get).toHaveBeenCalledWith('prefix:all_orders');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'Orders fetched successfully (cache)',
      data: cachedOrders,
    });
  });

  test('getAllOrders - cache miss', async () => {
    redisClient.get.mockResolvedValue(null);
    const dbOrders = [{ id: 1 }];
    ordRepo.findAll.mockResolvedValue(dbOrders);

    getPrefixedKey.mockReturnValue('prefix:all_orders');

    await getAllOrders({}, res, next);

    expect(ordRepo.findAll).toHaveBeenCalled();
    expect(redisClient.set).toHaveBeenCalledWith('prefix:all_orders', JSON.stringify(dbOrders), { EX: 3600 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'Orders fetched successfully',
      data: dbOrders,
    });
  });

  test('getOrderById - cache hit', async () => {
    const req = { params: { id: '1' } };
    const cachedOrder = { id: 1 };
    redisClient.get.mockResolvedValue(JSON.stringify(cachedOrder));
    getPrefixedKey.mockReturnValue('prefix:order:1');

    await getOrderById(req, res, next);

    expect(redisClient.get).toHaveBeenCalledWith('prefix:order:1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'Order fetched successfully (cache)',
      data: cachedOrder,
    });
  });

  test('getOrderById - not found', async () => {
    const req = { params: { id: '999' } };
    redisClient.get.mockResolvedValue(null);
    ordRepo.findById.mockResolvedValue(null);
    getPrefixedKey.mockReturnValue('prefix:order:999');

    await getOrderById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      message: 'Order not found',
      data: null,
    });
  });

  test('updateOrder - found', async () => {
    const req = {
      params: { id: '1' },
      body: { userId: 1, datetime: '2025-05-12', restaurantId: 2 },
    };
    const updatedOrder = { id: 1, userId: 1 };
    ordRepo.update.mockResolvedValue(updatedOrder);

    await updateOrder(req, res, next);

    expect(ordRepo.update).toHaveBeenCalledWith('1', 1, '2025-05-12', 2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'Order updated successfully',
      data: updatedOrder,
    });
  });

  test('updateOrder - not found', async () => {
    const req = {
      params: { id: '999' },
      body: { userId: 1, datetime: 'x', restaurantId: 1 },
    };
    ordRepo.update.mockResolvedValue(null);

    await updateOrder(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      message: 'Order not found',
      data: null,
    });
  });

  test('deleteOrder - success', async () => {
    const req = { params: { id: '1' } };
    ordRepo.remove.mockResolvedValue(true);

    await deleteOrder(req, res, next);

    expect(ordRepo.remove).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'Order deleted successfully',
      data: null,
    });
  });

  test('deleteOrder - not found', async () => {
    const req = { params: { id: '999' } };
    ordRepo.remove.mockResolvedValue(null);

    await deleteOrder(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      message: 'Order not found',
      data: null,
    });
  });
});
