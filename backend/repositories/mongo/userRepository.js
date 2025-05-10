const mongoose = require('mongoose');

const User = new mongoose.Schema({
  userId: Number,
  role: String,
  username: String,
  email: String,
  password: String
});

// Create a user
const createUser = async (req, res) => {
  try {
    const { userId, role, username, email, password } = req.body;
    const user = new User({ userId, role, username, email, password });
    await user.save();
    res.status(201).json({ message: 'User created', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // or db.find({}).toArray()
    return res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ userId: parseInt(req.params.id) });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { userId: parseInt(req.params.id) },
      req.body,
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User updated', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({ userId: parseInt(req.params.id) });
    if (!deletedUser) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password }); // ⚠️ Don't use this in production (no hashing)
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ message: 'Login successful', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  create: createUser,
  findAll: getAllUsers,
  findById: getUserById,
  update: updateUser,
  remove: deleteUser,
  login: loginUser, 
};