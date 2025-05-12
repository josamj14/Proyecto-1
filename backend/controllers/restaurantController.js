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

// Crear restaurante (SIN CACHÉ)
const createRestaurant = async (req, res, next) => {
  const { name, address } = req.body;
  try {
    const restRepo = getRepository("restaurant");
    await restRepo.create(name, address);
    handleResponse(res, 201, "Restaurant created successfully");
  } catch (err) {
    next(err);
  }
};

// Obtener todos los restaurantes (CON CACHÉ)
const getAllRestaurants = async (req, res, next) => {
  try {
    const restRepo = getRepository("restaurant");
    // 🗝️ Generar la llave del caché
    const cacheKey = getPrefixedKey("all_restaurants");

    // 🔄 Verificar si ya está en caché
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("📌 Cache hit para todos los restaurantes");
      return handleResponse(res, 200, "Restaurants fetched successfully (cache)", JSON.parse(cachedData));
    }

    // ⚠️ Cache Miss, ir a la base de datos
    const restaurants = await restRepo.findAll();
    handleResponse(res, 200, "Restaurants fetched successfully", restaurants);

    // 🔄 Guardar en Redis
    await redisClient.set(cacheKey, JSON.stringify(restaurants), {
      EX: 60 * 60, // Expira en 1 hora
    });

  } catch (err) {
    next(err);
  }
};

// Obtener un restaurante por ID (CON CACHÉ)
const getRestaurantById = async (req, res, next) => {
  try {
    const restRepo = getRepository("restaurant");
    // 🗝️ Generar la llave del caché
    const cacheKey = getPrefixedKey(`restaurant:${req.params.id}`);

    // 🔄 Verificar si ya está en caché
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log(`📌 Cache hit para el restaurante con ID ${req.params.id}`);
      return handleResponse(res, 200, "Restaurant fetched successfully (cache)", JSON.parse(cachedData));
    }

    // ⚠️ Cache Miss, ir a la base de datos
    const restaurant = await restRepo.findById(req.params.id);
    if (!restaurant) return handleResponse(res, 404, "Restaurant not found");
    handleResponse(res, 200, "Restaurant fetched successfully", restaurant);

    // 🔄 Guardar en Redis
    await redisClient.set(cacheKey, JSON.stringify(restaurant), {
      EX: 60 * 60, // Expira en 1 hora
    });

  } catch (err) {
    next(err);
  }
};

// Actualizar restaurante (SIN CACHÉ)
const updateRestaurant = async (req, res, next) => {
  const { name, address } = req.body;
  try {
    const restRepo = getRepository("restaurant");
    const updatedRestaurant = await restRepo.update(req.params.id, name, address);
    if (!updatedRestaurant) return handleResponse(res, 404, "Restaurant not found");
    handleResponse(res, 200, "Restaurant updated successfully", updatedRestaurant);
  } catch (err) {
    next(err);
  }
};

// Eliminar restaurante (SIN CACHÉ)
const deleteRestaurant = async (req, res, next) => {
  try {
    const restRepo = getRepository("restaurant");
    const deletedRestaurant = await restRepo.remove(req.params.id);
    if (!deletedRestaurant) return handleResponse(res, 404, "Restaurant not found");
    handleResponse(res, 200, "Restaurant deleted successfully");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
};
