const {
    createOrderService,
    getAllOrdersService,
    getOrderByIdService,
    updateOrderService,
    deleteOrderService,
  } = require('../models/orderModel');
  const pool = require('../db');  // Importing pool to mock DB calls
  
  jest.mock('../db');  // Mock the actual DB connection
  
  describe('Order Model Tests', () => {
    // Test for createOrderService
    it('should create an order successfully', async () => {
      const userId = 1;
      const datetime = '2025-03-25 10:00:00';
      const restaurantId = 1;
  
      pool.query.mockResolvedValue({ rows: [{ id: 1, user_id: userId, datetime, restaurant_id: restaurantId }] });
      const result = await createOrderService(userId, datetime, restaurantId);
      expect(result.rows[0]).toEqual({ id: 1, user_id: userId, datetime, restaurant_id: restaurantId });
    });
  
    // Test for getAllOrdersService
    it('should return all orders', async () => {
      const orders = [
        { id: 1, user_id: 1, datetime: '2025-03-25 10:00:00', restaurant_id: 1 },
        { id: 2, user_id: 2, datetime: '2025-03-26 11:00:00', restaurant_id: 2 },
      ];
  
      pool.query.mockResolvedValue({ rows: orders });
      const result = await getAllOrdersService();
      expect(result).toEqual(orders);
    });
  
    // Test for getOrderByIdService
    it('should return an order by ID', async () => {
      const orderId = 1;
      const order = { id: 1, user_id: 1, datetime: '2025-03-25 10:00:00', restaurant_id: 1 };
  
      pool.query.mockResolvedValue({ rows: [order] });
      const result = await getOrderByIdService(orderId);
      expect(result).toEqual(order);
    });
  
    // Test for updateOrderService
    it('should update an order successfully', async () => {
      const orderId = 1;
      const userId = 1;
      const datetime = '2025-03-25 11:00:00';
      const restaurantId = 2;
  
      pool.query.mockResolvedValue({ rows: [{ id: 1, user_id: userId, datetime, restaurant_id: restaurantId }] });
      const result = await updateOrderService(orderId, userId, datetime, restaurantId);
      expect(result.rows[0]).toEqual({ id: 1, user_id: userId, datetime, restaurant_id: restaurantId });
    });
  
    // Test for deleteOrderService
    it('should delete an order successfully', async () => {
      const orderId = 1;
      pool.query.mockResolvedValue({ rows: [{ id: orderId }] });
      const result = await deleteOrderService(orderId);
      expect(result.rows[0].id).toBe(orderId);
    });
  });
  