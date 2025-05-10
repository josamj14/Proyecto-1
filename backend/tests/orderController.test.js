const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} = require('../controllers/orderController');

const {
  createOrderService,
  getAllOrdersService,
  getOrderByIdService,
  updateOrderService,
  deleteOrderService,
} = require('../models/orderModel');

// MOCK for Model Tests
jest.mock('../models/orderModel');

describe('Order Controller Tests', () => {
  let mockResponse, mockRequest, mockNext;

  beforeEach(() => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
});

  // 1 Create Order 
test('should create an order successfully', async () => {
  mockRequest = { body: { userId: 1, datetime: '2025-03-25 12:00:00', restaurantId: 2 } };
  createOrderService.mockResolvedValue();

  await createOrder(mockRequest, mockResponse, mockNext);

  expect(createOrderService).toHaveBeenCalledWith(1, '2025-03-25 12:00:00', 2);
  expect(mockResponse.status).toHaveBeenCalledWith(201);
  expect(mockResponse.json).toHaveBeenCalledWith({ status: 201, message: "Order created successfully", data: null });
});

// 2 Get All Orders
test('should return all orders', async () => {
  const mockOrders = [{ id: 1, userId: 1, datetime: '2025-03-25 12:00:00', restaurantId: 2 }];
  getAllOrdersService.mockResolvedValue(mockOrders);

  await getAllOrders({}, mockResponse, mockNext);

  expect(getAllOrdersService).toHaveBeenCalled();
  expect(mockResponse.status).toHaveBeenCalledWith(200);
  expect(mockResponse.json).toHaveBeenCalledWith({ status: 200, message: "Orders fetched successfully", data: mockOrders });
});

// 3 Get Order by ID
test('should return a single order if found', async () => {
  mockRequest = { params: { id: 1 } };
  const mockOrder = { id: 1, userId: 1, datetime: '2025-03-25 12:00:00', restaurantId: 2 };
  getOrderByIdService.mockResolvedValue(mockOrder);

  await getOrderById(mockRequest, mockResponse, mockNext);

  expect(getOrderByIdService).toHaveBeenCalledWith(1);
  expect(mockResponse.status).toHaveBeenCalledWith(200);
  expect(mockResponse.json).toHaveBeenCalledWith({ status: 200, message: "Order fetched successfully", data: mockOrder });
});

// 4 Get Order by ID - ID not found
test('should return 404 if order not found', async () => {
  mockRequest = { params: { id: 99 } };
  getOrderByIdService.mockResolvedValue(null);

  await getOrderById(mockRequest, mockResponse, mockNext);

  expect(getOrderByIdService).toHaveBeenCalledWith(99);
  expect(mockResponse.status).toHaveBeenCalledWith(404);
  expect(mockResponse.json).toHaveBeenCalledWith({ status: 404, message: "Order not found", data: null });
});

// 5 Update Order 
test('should update an order successfully', async () => {
  mockRequest = { params: { id: 1 }, body: { userId: 2, datetime: '2025-03-26 14:00:00', restaurantId: 3 } };
  const updatedOrder = { id: 1, userId: 2, datetime: '2025-03-26 14:00:00', restaurantId: 3 };
  updateOrderService.mockResolvedValue(updatedOrder);

  await updateOrder(mockRequest, mockResponse, mockNext);

  expect(updateOrderService).toHaveBeenCalledWith(1, 2, '2025-03-26 14:00:00', 3);
  expect(mockResponse.status).toHaveBeenCalledWith(200);
  expect(mockResponse.json).toHaveBeenCalledWith({ status: 200, message: "Order updated successfully", data: updatedOrder });
});

// 6 Update Order - ID not found 
test('should return 404 if order to update is not found', async () => {
  mockRequest = { params: { id: 99 }, body: { userId: 2, datetime: '2025-03-26 14:00:00', restaurantId: 3 } };
  updateOrderService.mockResolvedValue(null);

  await updateOrder(mockRequest, mockResponse, mockNext);

  expect(updateOrderService).toHaveBeenCalledWith(99, 2, '2025-03-26 14:00:00', 3);
  expect(mockResponse.status).toHaveBeenCalledWith(404);
  expect(mockResponse.json).toHaveBeenCalledWith({ status: 404, message: "Order not found", data: null });
});

// 7 Delete Order 
test('should delete an order successfully', async () => {
  mockRequest = { params: { id: 1 } };
  deleteOrderService.mockResolvedValue(true);

  await deleteOrder(mockRequest, mockResponse, mockNext);

  expect(deleteOrderService).toHaveBeenCalledWith(1);
  expect(mockResponse.status).toHaveBeenCalledWith(200);
  expect(mockResponse.json).toHaveBeenCalledWith({ status: 200, message: "Order deleted successfully", data: null });
});

// 8 Delete  Order - ID not found
test('should return 404 if order to delete is not found', async () => {
  mockRequest = { params: { id: 99 } };
  deleteOrderService.mockResolvedValue(null);

  await deleteOrder(mockRequest, mockResponse, mockNext);

  expect(deleteOrderService).toHaveBeenCalledWith(99);
  expect(mockResponse.status).toHaveBeenCalledWith(404);
  expect(mockResponse.json).toHaveBeenCalledWith({ status: 404, message: "Order not found", data: null });
});

// 9 Error Handling
test('should pass errors to next middleware', async () => {
  mockRequest = { params: { id: 1 } };
  const error = new Error("Database error");
  getOrderByIdService.mockRejectedValue(error);

  await getOrderById(mockRequest, mockResponse, mockNext);

  expect(mockNext).toHaveBeenCalledWith(error);
});
});
