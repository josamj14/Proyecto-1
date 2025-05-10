const {
    createUserService,
    getAllUsersService,
    getUserByIdService,
    updateUserService,
    deleteUserService,
} = require('../models/userModel');
const pool = require('../db');  // Importing pool to mock DB calls
  
jest.mock('../db');  // Mock the actual DB connection

describe('User Model Tests', () => {
    // Test for create user service
    it('should create a user successfully', async () => {
        const role = 'admin';
        const name = 'John Doe';
        const email = 'john@example.com';
        const password = 'password123';
    
        pool.query.mockResolvedValue({ rows: [{ id: 1, role, name, email }] });
        const result = await createUserService(role, name, email, password);
        expect(result).toEqual({ id: 1, role, name, email });
    });
  
    // Test for get all users
    it('should return all users', async () => {
        const users = [
            { id: 1, role: 'admin', name: 'John Doe', email: 'john@example.com' },
            { id: 2, role: 'user', name: 'Jane Smith', email: 'jane@example.com' },
        ];
        pool.query.mockResolvedValue({ rows: users });
        const result = await getAllUsersService();
        expect(result).toEqual(users);
    });
  
    // Test for get user by id
    it('should return a user by ID', async () => {
        const userId = 1;
        const user = { id: 1, role: 'admin', name: 'John Doe', email: 'john@example.com' };
    
        pool.query.mockResolvedValue({ rows: [user] });
        const result = await getUserByIdService(userId);
        expect(result).toEqual(user);
    });
  
    // Test for update user
    it('should update a user successfully', async () => {
        const userId = 1;
        const name = 'John Updated';
        const email = 'john.updated@example.com';
        const password = 'newpassword123';
    
        pool.query.mockResolvedValue({ rows: [{ id: userId, role: 'admin', name, email }] });
        const result = await updateUserService(userId, name, email, password);
        expect(result).toEqual({ id: userId, role: 'admin', name, email });
    });
  
    // Test for delete user
    it('should delete a user successfully', async () => {
        const userId = 1;
        pool.query.mockResolvedValue({ rows: [{ id: userId }] });
        const result = await deleteUserService(userId);
        expect(result.id).toBe(userId);
    });
});
  