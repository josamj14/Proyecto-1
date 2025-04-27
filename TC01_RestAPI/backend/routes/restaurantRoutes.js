const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
} = require('../controllers/restaurantController.js');

// Rutas CRUD para Restaurante
router.get('/restaurant', verifyToken, (req, res, next) => {
  req.role = ['Client', 'Admin']; // Acceso permitido solo para 'client' o 'admin'
  next();
}, getAllRestaurants);

router.get('/restaurant/:id', verifyToken, (req, res, next) => {
  req.role = ['client', 'admin'];  // Acceso permitido solo para 'client' o 'admin'
  next();
}, getRestaurantById);

router.post('/restaurant', verifyToken, (req, res, next) => {
  req.role = 'Admin'; // Solo los admins pueden crear restaurantes
  next();
}, createRestaurant);

router.put('/restaurant/:id', verifyToken, (req, res, next) => {
  req.role = 'admin';  // Solo los admins pueden actualizar restaurantes
  next();
}, updateRestaurant);

router.delete('/restaurant/:id', verifyToken, (req, res, next) => {
  req.role = 'admin';  // Solo los admins pueden eliminar restaurantes
  next();
}, deleteRestaurant);

module.exports = router;