
jest.mock('../../db/redisClient', () => ({
  client: {
    get: jest.fn(),
    set: jest.fn(),
    on: jest.fn(), 
  },
  getPrefixedKey: jest.fn((key) => `prefix:${key}`),
}));

const {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
} = require('../../controllers/reservationController');

const { getRepository } = require('../../repositories/respositoryFactory');
const { client: redisClient, getPrefixedKey } = require('../../db/redisClient');

jest.mock('../../repositories/respositoryFactory');

describe('reservationController', () => {
  let res, next, resvRepo;

  beforeEach(() => {
    resvRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    getRepository.mockReturnValue(resvRepo);

    redisClient.get = jest.fn();
    redisClient.set = jest.fn();

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  test('createReservation - success', async () => {
    const req = {
      body: { userId: 1, datetime: '2025-05-12T10:00', capacity: 4, tableId: 2, restaurantId: 3 },
    };

    await createReservation(req, res, next);

    expect(resvRepo.create).toHaveBeenCalledWith(1, '2025-05-12T10:00', 4, 2, 3);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: 201,
      message: 'Reservation created successfully',
      data: null,
    });
  });

  test('getAllReservations - cache hit', async () => {
    const cached = [{ id: 1 }];
    redisClient.get.mockResolvedValue(JSON.stringify(cached));
    getPrefixedKey.mockReturnValue('prefix:all_reservations');

    await getAllReservations({}, res, next);

    expect(redisClient.get).toHaveBeenCalledWith('prefix:all_reservations');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'Reservations fetched successfully (cache)',
      data: cached,
    });
  });

  test('getAllReservations - cache miss', async () => {
    redisClient.get.mockResolvedValue(null);
    const dbData = [{ id: 2 }];
    resvRepo.findAll.mockResolvedValue(dbData);
    getPrefixedKey.mockReturnValue('prefix:all_reservations');

    await getAllReservations({}, res, next);

    expect(resvRepo.findAll).toHaveBeenCalled();
    expect(redisClient.set).toHaveBeenCalledWith('prefix:all_reservations', JSON.stringify(dbData), { EX: 3600 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'Reservations fetched successfully',
      data: dbData,
    });
  });

  test('getReservationById - cache hit', async () => {
    const req = { params: { id: '1' } };
    const cached = { id: 1 };
    redisClient.get.mockResolvedValue(JSON.stringify(cached));
    getPrefixedKey.mockReturnValue('prefix:reservation:1');

    await getReservationById(req, res, next);

    expect(redisClient.get).toHaveBeenCalledWith('prefix:reservation:1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'Reservation fetched successfully (cache)',
      data: cached,
    });
  });

  test('getReservationById - not found', async () => {
    const req = { params: { id: '999' } };
    redisClient.get.mockResolvedValue(null);
    resvRepo.findById.mockResolvedValue(null);
    getPrefixedKey.mockReturnValue('prefix:reservation:999');

    await getReservationById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      message: 'Reservation not found',
      data: null,
    });
  });

  test('updateReservation - success', async () => {
    const req = {
      params: { id: '1' },
      body: { userId: 1, datetime: '2025-05-12', capacity: 4, tableId: 2, restaurantId: 3 },
    };
    const updated = { id: 1, capacity: 4 };
    resvRepo.update.mockResolvedValue(updated);

    await updateReservation(req, res, next);

    expect(resvRepo.update).toHaveBeenCalledWith('1', 1, '2025-05-12', 4, 2, 3);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'Reservation updated successfully',
      data: updated,
    });
  });

  test('updateReservation - not found', async () => {
    const req = {
      params: { id: '999' },
      body: { userId: 1, datetime: '', capacity: 1, tableId: 1, restaurantId: 1 },
    };
    resvRepo.update.mockResolvedValue(null);

    await updateReservation(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      message: 'Reservation not found',
      data: null,
    });
  });

  test('deleteReservation - success', async () => {
    const req = { params: { id: '1' } };
    resvRepo.remove.mockResolvedValue(true);

    await deleteReservation(req, res, next);

    expect(resvRepo.remove).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'Reservation deleted successfully',
      data: null,
    });
  });

  test('deleteReservation - not found', async () => {
    const req = { params: { id: '999' } };
    resvRepo.remove.mockResolvedValue(null);

    await deleteReservation(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      message: 'Reservation not found',
      data: null,
    });
  });
});
