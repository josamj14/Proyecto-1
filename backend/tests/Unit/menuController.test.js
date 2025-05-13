
jest.mock('../../db/redisClient', () => ({
  client: {
    set: jest.fn(),
    on: jest.fn(), 
  },
  getPrefixedKey: jest.fn((key) => `prefix:${key}`),
}));


const {
  createMenu,
  getAllMenus,
  getMenuById,
  updateMenu,
  deleteMenu,
} = require('../../controllers/menuController');

const { getRepository } = require('../../repositories/respositoryFactory');
const { client: redisClient, getPrefixedKey } = require('../../db/redisClient');

jest.mock('../../repositories/respositoryFactory');

describe('menuController', () => {
  let res, next, menuRepo;

  beforeEach(() => {
    menuRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    getRepository.mockReturnValue(menuRepo);

    redisClient.set = jest.fn();

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test('getAllMenus - success', async () => {
    const mockMenus = [{ id: 1, name: 'Menu 1' }];
    menuRepo.findAll.mockResolvedValue(mockMenus);
    getPrefixedKey.mockReturnValue('prefix:all_menus');

    await getAllMenus({}, res, next);

    expect(menuRepo.findAll).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'Menus fetched successfully',
      data: mockMenus,
    });
    expect(redisClient.set).toHaveBeenCalledWith('prefix:all_menus', JSON.stringify(mockMenus), { EX: 3600 });
  });

  test('getMenuById - found', async () => {
    const req = { params: { id: '1' } };
    const mockMenu = { id: 1, name: 'Menu 1' };
    menuRepo.findById.mockResolvedValue(mockMenu);
    getPrefixedKey.mockReturnValue('prefix:menu:1');

    await getMenuById(req, res, next);

    expect(menuRepo.findById).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'Menu fetched successfully',
      data: mockMenu,
    });
    expect(redisClient.set).toHaveBeenCalledWith('prefix:menu:1', JSON.stringify(mockMenu), { EX: 3600 });
  });

  test('getMenuById - not found', async () => {
    const req = { params: { id: '999' } };
    menuRepo.findById.mockResolvedValue(null);

    await getMenuById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      message: 'Menu not found',
      data: null,
    });
  });

  test('createMenu - success', async () => {
    const req = { body: { name: 'New Menu' } };

    await createMenu(req, res, next);

    expect(menuRepo.create).toHaveBeenCalledWith('New Menu');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: 201,
      message: 'Menu created successfully',
      data: null,
    });
  });

  test('updateMenu - found', async () => {
    const req = { params: { id: '1' }, body: { name: 'Updated Menu' } };
    const updated = { id: 1, name: 'Updated Menu' };
    menuRepo.update.mockResolvedValue(updated);

    await updateMenu(req, res, next);

    expect(menuRepo.update).toHaveBeenCalledWith('1', 'Updated Menu');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'Menu updated successfully',
      data: updated,
    });
  });

  test('updateMenu - not found', async () => {
    const req = { params: { id: '999' }, body: { name: 'None' } };
    menuRepo.update.mockResolvedValue(null);

    await updateMenu(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      message: 'Menu not found',
      data: null,
    });
  });

  test('deleteMenu - found', async () => {
    const req = { params: { id: '1' } };
    menuRepo.remove.mockResolvedValue(true);

    await deleteMenu(req, res, next);

    expect(menuRepo.remove).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'Menu deleted successfully',
      data: null,
    });
  });

  test('deleteMenu - not found', async () => {
    const req = { params: { id: '999' } };
    menuRepo.remove.mockResolvedValue(null);

    await deleteMenu(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      message: 'Menu not found',
      data: null,
    });
  });
});
