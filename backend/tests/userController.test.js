//Import controllers and models to test them
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const {
  createUserService,
  getAllUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService,
} = require('../models/userModel');

//Model functions will be mocked
jest.mock('../models/userModel');

//This will create a suite of tests for this particular controller = User Controller 
describe('User Controller Tests', () => {
  //Variables used by mock to test the controller
  let mockResponse, mockRequest, mockNext;
  //Will be reset before each test
  beforeEach(() => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  // 1 Create User test
  test('should create a new user successfully', async () => {
    mockRequest = { body: { role: 'admin', name: 'John Doe', email: 'john@example.com', password: 'password123' } };
    const mockNewUser = { id: 1, role: 'admin', name: 'John Doe', email: 'john@example.com' };
    createUserService.mockResolvedValue(mockNewUser);

    await createUser(mockRequest, mockResponse, mockNext);

    expect(createUserService).toHaveBeenCalledWith('admin', 'John Doe', 'john@example.com', 'password123');
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({ status: 201, message: "User created successfully", data: mockNewUser });
  });

  // 2 Get all users test
  test('should return all users in db', async () => {
    const mockUsers = [{ id: 1, role: 'admin', name: 'John Doe', email: 'john@example.com' }];
    getAllUsersService.mockResolvedValue(mockUsers);

    await getAllUsers({}, mockResponse, mockNext);

    expect(getAllUsersService).toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ status: 200, message: "Users fetched successfully", data: mockUsers });
  });

  // 3 Get User by ID test
  test('should return a single user', async () => {
    mockRequest = { params: { id: 1 } };
    const mockUser = { id: 1, role: 'admin', name: 'John Doe', email: 'john@example.com' };
    getUserByIdService.mockResolvedValue(mockUser);

    await getUserById(mockRequest, mockResponse, mockNext);

    expect(getUserByIdService).toHaveBeenCalledWith(1);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ status: 200, message: "User fetched successfully", data: mockUser });
  });

  // 4 Get user by id - not found
  test('should return 404 bc user not found', async () => {
    mockRequest = { params: { id: 99 } };
    getUserByIdService.mockResolvedValue(null);

    await getUserById(mockRequest, mockResponse, mockNext);

    expect(getUserByIdService).toHaveBeenCalledWith(99);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ status: 404, message: "User not found", data: null });
  });

  // 5 Update user test
  test('should update a user successfully', async () => {
    mockRequest = { params: { id: 1 }, body: { name: 'Updated John', email: 'updated@example.com' } };
    const updatedUser = { id: 1, role: 'admin', name: 'Updated John', email: 'updated@example.com' };
    updateUserService.mockResolvedValue(updatedUser);

    await updateUser(mockRequest, mockResponse, mockNext);

    expect(updateUserService).toHaveBeenCalledWith(1, 'Updated John', 'updated@example.com');
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ status: 200, message: "User updated successfully", data: updatedUser });
  });

  // 6 Update User - ID not found
  test('should return 404 if user to update is not found', async () => {
    mockRequest = { params: { id: 99 }, body: { name: 'Updated User', email: 'updated@example.com' } };
    updateUserService.mockResolvedValue(null);

    await updateUser(mockRequest, mockResponse, mockNext);

    expect(updateUserService).toHaveBeenCalledWith(99, 'Updated User', 'updated@example.com');
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ status: 404, message: "User not found", data: null });
  });

  // 7 Delete User 
  test('should delete a user', async () => {
    mockRequest = { params: { id: 1 } };
    deleteUserService.mockResolvedValue(true);

    await deleteUser(mockRequest, mockResponse, mockNext);

    expect(deleteUserService).toHaveBeenCalledWith(1);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ status: 200, message: "User deleted successfully", data: null });
  });

  // 8 Delete User - ID not found
  test('should return 404 if user to delete is not found', async () => {
    mockRequest = { params: { id: 99 } };
    deleteUserService.mockResolvedValue(null);

    await deleteUser(mockRequest, mockResponse, mockNext);

    expect(deleteUserService).toHaveBeenCalledWith(99);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ status: 404, message: "User not found", data: null });
  });

  // 9 Error handling from db error
  test('should pass errors to next middleware', async () => {
    mockRequest = { params: { id: 1 } };
    const error = new Error("Database error");
    getUserByIdService.mockRejectedValue(error);

    await getUserById(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
