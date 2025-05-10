const {
    createMenu,
    getAllMenus,
    getMenuById,
    updateMenu,
    deleteMenu,
  } = require('../controllers/menuController');
  const {
    createMenuService,
    getAllMenusService,
    getMenuByIdService,
    updateMenuService,
    deleteMenuService,
  } = require('../models/menuModel');
  
  //MOCK for Menu tests
  
  jest.mock('../models/menuModel');
  
  describe('Menu Controller', () => {
    let res, next;
    beforeEach(() => {
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
  });

  // 1 Create Menu
  test('createMenu should call createMenuService and respond with 201', async () => {
    const req = { body: { name: 'Test Menu' } };
    createMenuService.mockResolvedValue();

    await createMenu(req, res, next);

    expect(createMenuService).toHaveBeenCalledWith('Test Menu');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: 201,
      message: 'Menu created successfully',
      data: null,
    });
    
  });

  //2 Get All Menus
  test('getAllMenus should return all menus with status 200', async () => {
    const mockMenus = [{ id: 1, name: 'Menu 1' }, { id: 2, name: 'Menu 2' }];
    getAllMenusService.mockResolvedValue(mockMenus);

    await getAllMenus({}, res, next);

    expect(getAllMenusService).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'Menus fetched successfully',
      data: mockMenus,
    });
  });

  //3 Get Menu by ID
  test('getMenuById should return a menu if found', async () => {
    const req = { params: { id: 1 } };
    const mockMenu = { id: 1, name: 'Test Menu' };
    getMenuByIdService.mockResolvedValue(mockMenu);

    await getMenuById(req, res, next);

    expect(getMenuByIdService).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'Menu fetched successfully',
      data: mockMenu,
    });
  });

  // 4 Get Menu by ID - ID not found
  test('getMenuById should return 404 if menu is not found', async () => {
    const req = { params: { id: 99 } };
    getMenuByIdService.mockResolvedValue(null);

    await getMenuById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      message: 'Menu not found',
      data: null,
    });
  });

  // 5 Update Menu
  test('updateMenu should update a menu and return 200', async () => {
    const req = { params: { id: 1 }, body: { name: 'Updated Menu' } };
    const mockUpdatedMenu = { id: 1, name: 'Updated Menu' };
    updateMenuService.mockResolvedValue(mockUpdatedMenu);

    await updateMenu(req, res, next);

    expect(updateMenuService).toHaveBeenCalledWith(1, 'Updated Menu');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'Menu updated successfully',
      data: mockUpdatedMenu,
    });
  });

  // 6 Delete a menu
  test('deleteMenu should delete a menu and return 200', async () => {
    const req = { params: { id: 1 } };
    deleteMenuService.mockResolvedValue(true);

    await deleteMenu(req, res, next);

    expect(deleteMenuService).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'Menu deleted successfully',
      data: null,
    });
  });

  // 7 Delete a menu - ID not found
  test('deleteMenu should return 404 if menu not found', async () => {
    const req = { params: { id: 99 } };
    deleteMenuService.mockResolvedValue(null);

    await deleteMenu(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      message: 'Menu not found',
      data: null,
    });
  });
});
