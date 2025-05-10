const { 
    createMenuService, 
    getAllMenusService, 
    getMenuByIdService, 
    updateMenuService, 
    deleteMenuService 
  } = require('../models/menuModel');  // Make sure to update the path according to your file structure
  
  const pool = require('../db');
  
  // Mock the pool.query method
  jest.mock('../db');
  
  describe('Menu Model Tests', () => {
    // Test for createMenuService
    describe('createMenuService', () => {
      it('should create a new menu and return the result', async () => {
        // Mock the result returned by the database
        pool.query.mockResolvedValueOnce({ 
          rows: [{ id: 1, name: 'Lunch Menu' }] 
        });
  
        const result = await createMenuService('Lunch Menu');
        expect(result.rows[0]).toEqual({ id: 1, name: 'Lunch Menu' });
      });
    });
  
    // Test for getAllMenusService
    describe('getAllMenusService', () => {
      it('should return all menus', async () => {
        pool.query.mockResolvedValueOnce({
          rows: [
            { id: 1, name: 'Lunch Menu' },
            { id: 2, name: 'Dinner Menu' }
          ]
        });
  
        const result = await getAllMenusService();
        expect(result).toEqual([
          { id: 1, name: 'Lunch Menu' },
          { id: 2, name: 'Dinner Menu' }
        ]);
      });
    });
  
    // Test for getMenuByIdService
    describe('getMenuByIdService', () => {
      it('should return a menu for a given ID', async () => {
        pool.query.mockResolvedValueOnce({
          rows: [{ id: 1, name: 'Lunch Menu' }]
        });
  
        const result = await getMenuByIdService(1);
        expect(result).toEqual({ id: 1, name: 'Lunch Menu' });
      });
  
      it('should return null if menu is not found', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });  // No menu found
  
        const result = await getMenuByIdService(999);  // Non-existent menu ID
        expect(result).toBeUndefined();
      });
    });
  
    // Test for updateMenuService
    describe('updateMenuService', () => {
      it('should update an existing menu and return the result', async () => {
        pool.query.mockResolvedValueOnce({
          rows: [{ id: 1, name: 'Updated Menu' }]
        });
  
        const result = await updateMenuService(1, 'Updated Menu');
        expect(result.rows[0]).toEqual({ id: 1, name: 'Updated Menu' });
      });
    });
  
    // Test for deleteMenuService
    describe('deleteMenuService', () => {
      it('should delete a menu and return the result', async () => {
        pool.query.mockResolvedValueOnce({ 
          rows: [{ id: 1 }] 
        });
  
        const result = await deleteMenuService(1);
        expect(result.rows[0]).toEqual({ id: 1 });
      });
  
      it('should return null if menu is not found to delete', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });  // No menu to delete
  
        const result = await deleteMenuService(999);  // Non-existent menu ID
        expect(result.rows).toEqual([]);
      });
    });
  });
  