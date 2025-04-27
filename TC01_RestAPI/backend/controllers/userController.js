const {
    createUserService,
    deleteUserService,
    getAllUsersService,
    getUserByIdService,
    updateUserService,
  } = require("../models/userModel.js");
  
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
      const newUser = await createUserService(role, name, email, password);
      handleResponse(res, 201, "User created successfully", newUser);
    } catch (err) {
      next(err);
    }
  };
  
   const getAllUsers = async (req, res, next) => {
    try {
      const users = await getAllUsersService();
      handleResponse(res, 200, "Users fetched successfully", users);
    } catch (err) {
      next(err);
    }
  };
  
   const getUserById = async (req, res, next) => {
    try {
      const user = await getUserByIdService(req.params.id);
      if (!user) return handleResponse(res, 404, "User not found");
      handleResponse(res, 200, "User fetched successfully", user);
    } catch (err) {
      next(err);
    }
  };
  
   const updateUser = async (req, res, next) => {
    const { name, email } = req.body;
    try {
      const updatedUser = await updateUserService(req.params.id, name, email);
      if (!updatedUser) return handleResponse(res, 404, "User not found");
      handleResponse(res, 200, "User updated successfully", updatedUser);
    } catch (err) {
      next(err);
    }
  };
  
   const deleteUser = async (req, res, next) => {
    try {
      const deletedUser = await deleteUserService(req.params.id);
      if (!deletedUser) return handleResponse(res, 404, "User not found");
      handleResponse(res, 200, "User deleted successfully", deleteUser);
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
  };