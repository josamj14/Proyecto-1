const {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
} = require('../controllers/reservationController');

const {
  createReservationService,
  getAllReservationsService,
  getReservationByIdService,
  updateReservationService,
  deleteReservationService,
} = require('../models/reservationModel');

// MOCK 

jest.mock('../models/reservationModel');
  
describe('Reservation Controller Tests', () => {
  let mockResponse, mockRequest, mockNext;

  beforeEach(() => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  // 1 Create a reservation
  test('should create a reservation successfully', async () => {
    mockRequest = { body: { userId: 1, datetime: '2025-03-25 18:00:00', capacity: 4, tableId: 2, restaurantId: 3 } };
    createReservationService.mockResolvedValue();

    await createReservation(mockRequest, mockResponse, mockNext);

    expect(createReservationService).toHaveBeenCalledWith(1, '2025-03-25 18:00:00', 4, 2, 3);
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({ status: 201, message: "Reservation created successfully", data: null });
  });

  // 2 Get all reservations
  test('should return all reservations', async () => {
    const mockReservations = [{ id: 1, userId: 1, datetime: '2025-03-25 18:00:00', capacity: 4, tableId: 2, restaurantId: 3 }];
    getAllReservationsService.mockResolvedValue(mockReservations);

    await getAllReservations({}, mockResponse, mockNext);

    expect(getAllReservationsService).toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ status: 200, message: "Reservations fetched successfully", data: mockReservations });
  });

  // 3 Get reservation by ID
  test('should return a single reservation if found', async () => {
    mockRequest = { params: { id: 1 } };
    const mockReservation = { id: 1, userId: 1, datetime: '2025-03-25 18:00:00', capacity: 4, tableId: 2, restaurantId: 3 };
    getReservationByIdService.mockResolvedValue(mockReservation);

    await getReservationById(mockRequest, mockResponse, mockNext);

    expect(getReservationByIdService).toHaveBeenCalledWith(1);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ status: 200, message: "Reservation fetched successfully", data: mockReservation });
  });

  // 4 Get reservation by ID - ID not found
  test('should return 404 if reservation not found', async () => {
    mockRequest = { params: { id: 99 } };
    getReservationByIdService.mockResolvedValue(null);

    await getReservationById(mockRequest, mockResponse, mockNext);

    expect(getReservationByIdService).toHaveBeenCalledWith(99);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ status: 404, message: "Reservation not found", data: null });
  });

  // 5 Update reservation
  test('should update a reservation successfully', async () => {
    mockRequest = { params: { id: 1 }, body: { userId: 2, datetime: '2025-03-26 19:00:00', capacity: 4, tableId: 3, restaurantId: 2 } };
    const updatedReservation = { id: 1, userId: 2, datetime: '2025-03-26 19:00:00', capacity: 4, tableId: 3, restaurantId: 2 };
    updateReservationService.mockResolvedValue(updatedReservation);

    await updateReservation(mockRequest, mockResponse, mockNext);

    expect(updateReservationService).toHaveBeenCalledWith(1, 2, '2025-03-26 19:00:00', 4, 3, 2);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ status: 200, message: "Reservation updated successfully", data: updatedReservation });
  });

  // 6 Update a reservation - ID not found
  test('should return 404 if reservation to update is not found', async () => {
    mockRequest = { params: { id: 99 }, body: { userId: 2, datetime: '2025-03-26 19:00:00', capacity: 4, tableId: 3, restaurantId: 2 } };
    updateReservationService.mockResolvedValue(null);

    await updateReservation(mockRequest, mockResponse, mockNext);

    expect(updateReservationService).toHaveBeenCalledWith(99, 2, '2025-03-26 19:00:00', 4, 3, 2);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ status: 404, message: "Reservation not found", data: null });
  });

  // 7 Delete a reservation
  test('should delete a reservation successfully', async () => {
    mockRequest = { params: { id: 1 } };
    deleteReservationService.mockResolvedValue(true);

    await deleteReservation(mockRequest, mockResponse, mockNext);

    expect(deleteReservationService).toHaveBeenCalledWith(1);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ status: 200, message: "Reservation deleted successfully", data: null });
  });

  // 8 Delete reservation - ID not found
  test('should return 404 if reservation to delete is not found', async () => {
    mockRequest = { params: { id: 99 } };
    deleteReservationService.mockResolvedValue(null);

    await deleteReservation(mockRequest, mockResponse, mockNext);

    expect(deleteReservationService).toHaveBeenCalledWith(99);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ status: 404, message: "Reservation not found", data: null });
  });

  // 9 Error frpm db 
  test('should pass errors to next middleware', async () => {
    mockRequest = { params: { id: 1 } };
    const error = new Error("Database error");
    getReservationByIdService.mockRejectedValue(error);

    await getReservationById(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
