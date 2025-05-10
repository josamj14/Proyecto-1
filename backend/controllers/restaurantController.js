const { getRepository } = require("../repositories/respositoryFactory");
const restRepo = getRepository("restaurant");
  
  // Respuesta estandarizada
  const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({
      status,
      message,
      data,
    });
  };
  
  // Crear restaurante
  const createRestaurant = async (req, res, next) => {
    const { name, address } = req.body;
    try {
      await restRepo.create(name, address);
      handleResponse(res, 201, "Restaurant created successfully");
    } catch (err) {
      next(err);
    }
  };
  
  // Obtener todos los restaurantes
  const getAllRestaurants = async (req, res, next) => {
    try {
      const restaurants = await restRepo.findAll();
      handleResponse(res, 200, "Restaurants fetched successfully", restaurants);
    } catch (err) {
      next(err);
    }
  };
  
  // Obtener restaurante por ID
  const getRestaurantById = async (req, res, next) => {
    try {
      const restaurant = await restRepo.findById(req.params.id);
      if (!restaurant) return handleResponse(res, 404, "Restaurant not found");
      handleResponse(res, 200, "Restaurant fetched successfully", restaurant);
    } catch (err) {
      next(err);
    }
  };
  
  // Actualizar restaurante
  const updateRestaurant = async (req, res, next) => {
    const { name, address } = req.body;
    try {
      const updatedRestaurant = await restRepo.update(req.params.id, name, address);
      if (!updatedRestaurant) return handleResponse(res, 404, "Restaurant not found");
      handleResponse(res, 200, "Restaurant updated successfully", updatedRestaurant);
    } catch (err) {
      next(err);
    }
  };
  
  // Eliminar restaurante
  const deleteRestaurant = async (req, res, next) => {
    try {
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
  