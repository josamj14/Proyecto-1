const router = require('express').Router();

const {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
} = require('../controllers/restaurantController.js');

// Rutas CRUD para Restaurante
router.get('/restaurant', getAllRestaurants);               // Obtener todos los restaurantes
router.get('/restaurant/:id', getRestaurantById);           // Obtener restaurante por ID
router.post('/restaurant', createRestaurant);               // Crear nuevo restaurante
router.put('/restaurant/:id', updateRestaurant);            // Actualizar restaurante
router.delete('/restaurant/:id', deleteRestaurant);         // Eliminar restaurante

module.exports = router;
