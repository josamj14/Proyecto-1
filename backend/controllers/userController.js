const { getRepository } = require("../repositories/respositoryFactory");
const userRepo = getRepository("user");
  
  // Standardized response function
  const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({
      status,
      message,
      data,
    });
  };
  
   const createUser = async (req, res, next) => {
    const {role, name, email, password } = req.body;
    try {
      const newUser = await userRepo.create(role, name, email, password);
      handleResponse(res, 201, "User created successfully", newUser);
    } catch (err) {
      next(err);
    }
  };
  
   const getAllUsers = async (req, res, next) => {
    try {
      const users = await userRepo.findAll();
      handleResponse(res, 200, "Users fetched successfully", users);
    } catch (err) {
      next(err);
    }
  };
  
   const getUserById = async (req, res, next) => {
    try {
      const user = await userRepo.findById(req.params.id);
      if (!user) return handleResponse(res, 404, "User not found");
      handleResponse(res, 200, "User fetched successfully", user);
    } catch (err) {
      next(err);
    }
  };
  
   const updateUser = async (req, res, next) => {
    const { name, email } = req.body;
    try {
      const updatedUser = await userRepo.update(req.params.id, name, email);
      if (!updatedUser) return handleResponse(res, 404, "User not found");
      handleResponse(res, 200, "User updated successfully", updatedUser);
    } catch (err) {
      next(err);
    }
  };
  
   const deleteUser = async (req, res, next) => {
    try {
      const deletedUser = await userRepo.remove(req.params.id);
      if (!deletedUser) return handleResponse(res, 404, "User not found");
      handleResponse(res, 200, "User deleted successfully", null);
    } catch (err) {
      next(err);
    }
  };


  const loginUser = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await userRepo.login(email);
    if (!user) return handleResponse(res, 401, "Invalid credentials");
    handleResponse(res, 200, "Login successful", user);
  } catch (err) {
    next(err);
  }
};

  module.exports = {
    handleResponse,
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    loginUser,
  };