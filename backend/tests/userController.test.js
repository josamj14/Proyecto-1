
jest.mock('../db/redisClient', () => ({
  client: {
    get: jest.fn(),
    set: jest.fn(),
    on: jest.fn(), 
  },
  getPrefixedKey: jest.fn((key) => `prefix:${key}`),
}));

const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
} = require('../controllers/userController');

const { getRepository } = require('../repositories/respositoryFactory');
const { client: redisClient, getPrefixedKey } = require('../db/redisClient');

jest.mock('../repositories/respositoryFactory');

describe('userController', () => {
  let res, next, userRepo;

  beforeEach(() => {
    userRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      login: jest.fn(),
    };

    getRepository.mockReturnValue(userRepo);
    redisClient.get = jest.fn();
    redisClient.set = jest.fn();

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  test('createUser - success', async () => {
    const req = {
      body: { role: 'admin', name: 'Alice', email: 'alice@mail.com', password: 'secret' },
    };
    const createdUser = { id: 1, ...req.body };
    userRepo.create.mockResolvedValue(createdUser);

    await createUser(req, res, next);

    expect(userRepo.create).toHaveBeenCalledWith('admin', 'Alice', 'alice@mail.com', 'secret');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: 201,
      message: 'User created successfully',
      data: createdUser,
    });
  });

  test('getAllUsers - cache hit', async () => {
    const users = [{ id: 1, name: 'Bob' }];
    redisClient.get.mockResolvedValue(JSON.stringify(users));
    getPrefixedKey.mockReturnValue('prefix:all_users');

    await getAllUsers({}, res, next);

    expect(redisClient.get).toHaveBeenCalledWith('prefix:all_users');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'Users fetched successfully (cache)',
      data: users,
    });
  });

  test('getAllUsers - cache miss', async () => {
    redisClient.get.mockResolvedValue(null);
    const users = [{ id: 2, name: 'Charlie' }];
    userRepo.findAll.mockResolvedValue(users);
    getPrefixedKey.mockReturnValue('prefix:all_users');

    await getAllUsers({}, res, next);

    expect(userRepo.findAll).toHaveBeenCalled();
    expect(redisClient.set).toHaveBeenCalledWith('prefix:all_users', JSON.stringify(users), { EX: 3600 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'Users fetched successfully',
      data: users,
    });
  });

  test('getUserById - cache hit', async () => {
    const req = { params: { id: '1' } };
    const cachedUser = { id: 1, name: 'Dave' };
    redisClient.get.mockResolvedValue(JSON.stringify(cachedUser));
    getPrefixedKey.mockReturnValue('prefix:user:1');

    await getUserById(req, res, next);

    expect(redisClient.get).toHaveBeenCalledWith('prefix:user:1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'User fetched successfully (cache)',
      data: cachedUser,
    });
  });

  test('getUserById - not found', async () => {
    const req = { params: { id: '999' } };
    redisClient.get.mockResolvedValue(null);
    userRepo.findById.mockResolvedValue(null);
    getPrefixedKey.mockReturnValue('prefix:user:999');

    await getUserById(req, res, next);

    expect(userRepo.findById).toHaveBeenCalledWith('999');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      message: 'User not found',
      data: null,
    });
  });

  test('updateUser - success', async () => {
    const req = {
      params: { id: '1' },
      body: { name: 'Eve', email: 'eve@mail.com' },
    };
    const updated = { id: 1, ...req.body };
    userRepo.update.mockResolvedValue(updated);

    await updateUser(req, res, next);

    expect(userRepo.update).toHaveBeenCalledWith('1', 'Eve', 'eve@mail.com');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'User updated successfully',
      data: updated,
    });
  });

  test('updateUser - not found', async () => {
    const req = {
      params: { id: '999' },
      body: { name: 'Ghost', email: 'ghost@mail.com' },
    };
    userRepo.update.mockResolvedValue(null);

    await updateUser(req, res, next);

    expect(userRepo.update).toHaveBeenCalledWith('999', 'Ghost', 'ghost@mail.com');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      message: 'User not found',
      data: null,
    });
  });

  test('deleteUser - success', async () => {
    const req = { params: { id: '1' } };
    userRepo.remove.mockResolvedValue(true);

    await deleteUser(req, res, next);

    expect(userRepo.remove).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'User deleted successfully',
      data: null,
    });
  });

  test('deleteUser - not found', async () => {
    const req = { params: { id: '999' } };
    userRepo.remove.mockResolvedValue(null);

    await deleteUser(req, res, next);

    expect(userRepo.remove).toHaveBeenCalledWith('999');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      message: 'User not found',
      data: null,
    });
  });

  test('loginUser - success', async () => {
    const req = { body: { email: 'test@mail.com' } };
    const user = { id: 1, email: 'test@mail.com' };
    userRepo.login.mockResolvedValue(user);

    await loginUser(req, res, next);

    expect(userRepo.login).toHaveBeenCalledWith('test@mail.com');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'Login successful',
      data: user,
    });
  });

  test('loginUser - fail (unauthorized)', async () => {
    const req = { body: { email: 'fail@mail.com' } };
    userRepo.login.mockResolvedValue(null);

    await loginUser(req, res, next);

    expect(userRepo.login).toHaveBeenCalledWith('fail@mail.com');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      status: 401,
      message: 'Invalid credentials',
      data: null,
    });
  });
});
