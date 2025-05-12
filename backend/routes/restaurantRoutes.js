const router = require('express').Router();
const {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
} = require('../controllers/restaurantController.js');

const cacheMiddleware = require('../middlewares/cacheMiddleware');

// Rutas CRUD para restaurantes
router.get('/restaurant', cacheMiddleware(() => "all_restaurants"), getAllRestaurants);             // Obtener todos los restaurantes
router.get('/restaurant/:id', cacheMiddleware((req) => `restaurant:${req.params.id}`), getRestaurantById);  // Obtener restaurante por ID
router.post('/restaurant', createRestaurant);               // Crear nuevo restaurante
router.put('/restaurant/:id', updateRestaurant);            // Actualizar restaurante
router.delete('/restaurant/:id', deleteRestaurant);         // Eliminar restaurante

module.exports = router;
