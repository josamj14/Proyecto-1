const {
    createRestaurantService,
    getAllRestaurantsService,
    getRestaurantByIdService,
    updateRestaurantService,
    deleteRestaurantService,
  } = require('../models/restaurantModel');
  const pool = require('../db');  // Importing pool to mock DB calls
  
  jest.mock('../db');  // Mock the actual DB connection
  
  describe('Restaurant Model Tests', () => {
    // Test for createRestaurantService
    it('should create a restaurant successfully', async () => {
      const name = 'Pizza Place';
      const address = '123 Pizza Street';
  
      pool.query.mockResolvedValue({ rows: [{ id: 1, name, address }] });
      const result = await createRestaurantService(name, address);
      expect(result.rows[0]).toEqual({ id: 1, name, address });
    });
  
    // Test for getAllRestaurantsService
    it('should return all restaurants', async () => {
      const restaurants = [
        { id: 1, name: 'Pizza Place', address: '123 Pizza Street' },
        { id: 2, name: 'Burger Joint', address: '456 Burger Road' },
      ];
  
      pool.query.mockResolvedValue({ rows: restaurants });
      const result = await getAllRestaurantsService();
      expect(result).toEqual(restaurants);
    });
  
    // Test for getRestaurantByIdService
    it('should return a restaurant by ID', async () => {
      const restaurantId = 1;
      const restaurant = { id: 1, name: 'Pizza Place', address: '123 Pizza Street' };
      pool.query.mockResolvedValue({ rows: [restaurant] });
      const result = await getRestaurantByIdService(restaurantId);
      expect(result).toEqual(restaurant);
    });
  
    // Test for updateRestaurantService
    it('should update a restaurant successfully', async () => {
      const restaurantId = 1;
      const name = 'Pizza Palace';
      const address = '123 Pizza Street';
      pool.query.mockResolvedValue({ rows: [{ id: restaurantId, name, address }] });
      const result = await updateRestaurantService(restaurantId, name, address);
      expect(result.rows[0]).toEqual({ id: restaurantId, name, address });
    });
  
    // Test for deleteRestaurantService
    it('should delete a restaurant successfully', async () => {
      const restaurantId = 1;
      pool.query.mockResolvedValue({ rows: [{ id: restaurantId }] });
      const result = await deleteRestaurantService(restaurantId);
      expect(result.rows[0].id).toBe(restaurantId);
    });
  });
  