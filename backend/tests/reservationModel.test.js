const {
    createReservationService,
    getAllReservationsService,
    getReservationByIdService,
    updateReservationService,
    deleteReservationService,
  } = require('../models/reservationModel');
  const pool = require('../db');  // Importing pool to mock DB calls
  
  jest.mock('../db');  // Mock the actual DB connection
  
  describe('Reservation Model Tests', () => {
    // Test for createReservationService
    it('should create a reservation successfully', async () => {
      const userId = 1;
      const datetime = '2025-03-25 12:00:00';
      const capacity = 4;
      const tableId = 1;
      const restaurantId = 1;
  
      pool.query.mockResolvedValue({ rows: [{ id: 1, user_id: userId, datetime, capacity, table_id: tableId, restaurant_id: restaurantId }] });
      const result = await createReservationService(userId, datetime, capacity, tableId, restaurantId);
      expect(result.rows[0]).toEqual({ id: 1, user_id: userId, datetime, capacity, table_id: tableId, restaurant_id: restaurantId });
    });
  
    // Test for getAllReservationsService
    it('should return all reservations', async () => {
      const reservations = [
        { id: 1, user_id: 1, datetime: '2025-03-25 12:00:00', capacity: 4, table_id: 1, restaurant_id: 1 },
        { id: 2, user_id: 2, datetime: '2025-03-26 13:00:00', capacity: 2, table_id: 2, restaurant_id: 2 },
      ];
  
      pool.query.mockResolvedValue({ rows: reservations });
      const result = await getAllReservationsService();
      expect(result).toEqual(reservations);
    });
  
    // Test for getReservationByIdService
    it('should return a reservation by ID', async () => {
      const reservationId = 1;
      const reservation = { id: 1, user_id: 1, datetime: '2025-03-25 12:00:00', capacity: 4, table_id: 1, restaurant_id: 1 };
  
      pool.query.mockResolvedValue({ rows: [reservation] });
      const result = await getReservationByIdService(reservationId);
      expect(result).toEqual(reservation);
    });
  
    // Test for updateReservationService
    it('should update a reservation successfully', async () => {
      const reservationId = 1;
      const userId = 1;
      const datetime = '2025-03-25 14:00:00';
      const capacity = 6;
      const tableId = 2;
      const restaurantId = 1;
  
      pool.query.mockResolvedValue({ rows: [{ id: 1, user_id: userId, datetime, capacity, table_id: tableId, restaurant_id: restaurantId }] }); 
      const result = await updateReservationService(reservationId, userId, datetime, capacity, tableId, restaurantId);
      expect(result.rows[0]).toEqual({ id: 1, user_id: userId, datetime, capacity, table_id: tableId, restaurant_id: restaurantId });
    });
  
    // Test for deleteReservationService
    it('should delete a reservation successfully', async () => {
      const reservationId = 1;
      pool.query.mockResolvedValue({ rows: [{ id: reservationId }] });
      const result = await deleteReservationService(reservationId);
      expect(result.rows[0].id).toBe(reservationId);
    });
  });
  