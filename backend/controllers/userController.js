const { getRepository } = require("../repositories/respositoryFactory");

const { client: redisClient, getPrefixedKey } = require("../db/redisClient");

// Respuesta estandarizada
const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({
    status,
    message,
    data,
  });
};

// Crear usuario (SIN CACHÉ)
const createUser = async (req, res, next) => {
  const { role, name, email, password } = req.body;
  try {
    const userRepo = getRepository("user");
    const newUser = await userRepo.create(role, name, email, password);
    handleResponse(res, 201, "User created successfully", newUser);
  } catch (err) {
    next(err);
  }
};

// Obtener todos los usuarios (CON CACHÉ)
const getAllUsers = async (req, res, next) => {
  try {
    const userRepo = getRepository("user");
    // Generar la llave del caché
    const cacheKey = getPrefixedKey("all_users");

    // Verificar si ya está en caché
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log(" Cache hit para todos los usuarios");
      return handleResponse(res, 200, "Users fetched successfully (cache)", JSON.parse(cachedData));
    }

    // Cache Miss, ir a la base de datos
    const users = await userRepo.findAll();
    handleResponse(res, 200, "Users fetched successfully", users);

    // Guardar en Redis
    await redisClient.set(cacheKey, JSON.stringify(users), {
      EX: 60 * 60, // Expira en 1 hora
    });

  } catch (err) {
    next(err);
  }
};

// Obtener un usuario por ID (CON CACHÉ)
const getUserById = async (req, res, next) => {
  try {
    const userRepo = getRepository("user");
    // Generar la llave del caché
    const cacheKey = getPrefixedKey(`user:${req.params.id}`);

    // Verificar si ya está en caché
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log(` Cache hit para el usuario con ID ${req.params.id}`);
      return handleResponse(res, 200, "User fetched successfully (cache)", JSON.parse(cachedData));
    }

    // Cache Miss, ir a la base de datos
    const user = await userRepo.findById(req.params.id);
    if (!user) return handleResponse(res, 404, "User not found");
    handleResponse(res, 200, "User fetched successfully", user);

    // Guardar en Redis
    await redisClient.set(cacheKey, JSON.stringify(user), {
      EX: 60 * 60, // Expira en 1 hora
    });

  } catch (err) {
    next(err);
  }
};

// Actualizar usuario (SIN CACHÉ)
const updateUser = async (req, res, next) => {
  const { name, email } = req.body;
  try {
    const userRepo = getRepository("user");
    const updatedUser = await userRepo.update(req.params.id, name, email);
    if (!updatedUser) return handleResponse(res, 404, "User not found");
    handleResponse(res, 200, "User updated successfully", updatedUser);
  } catch (err) {
    next(err);
  }
};

// Eliminar usuario (SIN CACHÉ)
const deleteUser = async (req, res, next) => {
  try {
    const userRepo = getRepository("user");
    const deletedUser = await userRepo.remove(req.params.id);
    if (!deletedUser) return handleResponse(res, 404, "User not found");
    handleResponse(res, 200, "User deleted successfully", null);
  } catch (err) {
    next(err);
  }
};

// Login (SIN CACHÉ)
const loginUser = async (req, res, next) => {
  const { email } = req.body;
  try {
    const userRepo = getRepository("user");
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
