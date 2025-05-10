const {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
} = require('../controllers/restaurantController');

const {
  createRestaurantService,
  getAllRestaurantsService,
  getRestaurantByIdService,
  updateRestaurantService,
  deleteRestaurantService,
} = require('../models/restaurantModel');

jest.mock('../models/restaurantModel');

describe('Restaurant Controller Tests', () => {
  let mockResponse, mockRequest, mockNext;

  beforeEach(() => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  // 1 Create a restaurant
  test('should create a restaurant successfully', async () => {
    mockRequest = { body: { name: 'Restaurant A', address: '123 Street' } };
    createRestaurantService.mockResolvedValue();

    await createRestaurant(mockRequest, mockResponse, mockNext);

    expect(createRestaurantService).toHaveBeenCalledWith('Restaurant A', '123 Street');
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({ status: 201, message: "Restaurant created successfully", data: null });
  });

  // 2 Get all restaurants
  test('should return all restaurants', async () => {
    const mockRestaurants = [{ id: 1, name: 'Restaurant A', address: '123 Street' }];
    getAllRestaurantsService.mockResolvedValue(mockRestaurants);

    await getAllRestaurants({}, mockResponse, mockNext);

    expect(getAllRestaurantsService).toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ status: 200, message: "Restaurants fetched successfully", data: mockRestaurants });
  });

  // 3 Get one restaurant by id 
  test('should return a single restaurant if found', async () => {
    mockRequest = { params: { id: 1 } };
    const mockRestaurant = { id: 1, name: 'Restaurant A', address: '123 Street' };
    getRestaurantByIdService.mockResolvedValue(mockRestaurant);

    await getRestaurantById(mockRequest, mockResponse, mockNext);

    expect(getRestaurantByIdService).toHaveBeenCalledWith(1);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ status: 200, message: "Restaurant fetched successfully", data: mockRestaurant });
  });

  // 4 Get restaurant by id - ID not found
  test('should return 404 if restaurant not found', async () => {
    mockRequest = { params: { id: 99 } };
    getRestaurantByIdService.mockResolvedValue(null);

    await getRestaurantById(mockRequest, mockResponse, mockNext);

    expect(getRestaurantByIdService).toHaveBeenCalledWith(99);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ status: 404, message: "Restaurant not found", data: null });
  });

  // 5 Uodate restaurant
  test('should update a restaurant successfully', async () => {
    mockRequest = { params: { id: 1 }, body: { name: 'Updated Restaurant', address: '456 Avenue' } };
    const updatedRestaurant = { id: 1, name: 'Updated Restaurant', address: '456 Avenue' };
    updateRestaurantService.mockResolvedValue(updatedRestaurant);

    await updateRestaurant(mockRequest, mockResponse, mockNext);

    expect(updateRestaurantService).toHaveBeenCalledWith(1, 'Updated Restaurant', '456 Avenue');
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ status: 200, message: "Restaurant updated successfully", data: updatedRestaurant });
  });

  //6 Update restaurant - ID not found
  test('should return 404 if restaurant to update is not found', async () => {
    mockRequest = { params: { id: 99 }, body: { name: 'Updated Restaurant', address: '456 Avenue' } };
    updateRestaurantService.mockResolvedValue(null);

    await updateRestaurant(mockRequest, mockResponse, mockNext);

    expect(updateRestaurantService).toHaveBeenCalledWith(99, 'Updated Restaurant', '456 Avenue');
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ status: 404, message: "Restaurant not found", data: null });
  });

  //7 Delete restaurant 
  test('should delete a restaurant successfully', async () => {
    mockRequest = { params: { id: 1 } };
    deleteRestaurantService.mockResolvedValue(true);

    await deleteRestaurant(mockRequest, mockResponse, mockNext);

    expect(deleteRestaurantService).toHaveBeenCalledWith(1);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ status: 200, message: "Restaurant deleted successfully", data: null });
  });

  // 8 Del restaurant - ID not found
  test('should return 404 if restaurant to delete is not found', async () => {
    mockRequest = { params: { id: 99 } };
    deleteRestaurantService.mockResolvedValue(null);

    await deleteRestaurant(mockRequest, mockResponse, mockNext);

    expect(deleteRestaurantService).toHaveBeenCalledWith(99);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ status: 404, message: "Restaurant not found", data: null });
  });

  // 9 Errir from database
  test('should pass errors to next middleware', async () => {
    mockRequest = { params: { id: 1 } };
    const error = new Error("Database error");
    getRestaurantByIdService.mockRejectedValue(error);

    await getRestaurantById(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
