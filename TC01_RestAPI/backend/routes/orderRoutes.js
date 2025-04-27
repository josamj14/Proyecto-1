const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} = require('../controllers/orderController.js');

// Rutas CRUD para pedidos

router.get('/orders', verifyToken, (req, res, next) => {
  req.role = ['client', 'admin']; // Acceso permitido solo para 'client' o 'admin'
  next();
}, getAllOrders);               // Obtener todos los pedidos

router.get('/orders/:id', verifyToken, (req, res, next) => {
  req.role = ['client', 'admin']; // Acceso permitido solo para 'client' o 'admin'
  next();
}, getOrderById);               // Obtener pedido por ID

router.post('/orders', verifyToken, (req, res, next) => {
  req.role = 'admin';  // Solo los admins pueden crear pedidos
  next();
}, createOrder);               // Crear nuevo pedido

router.put('/orders/:id', verifyToken, (req, res, next) => {
  req.role = 'client';  // Solo el cliente propietario puede actualizar su pedido
  next();
}, updateOrder);            // Actualizar pedido

router.delete('/orders/:id', verifyToken, (req, res, next) => {
  req.role = 'admin';  // Solo los admins pueden eliminar pedidos
  next();
}, deleteOrder);         // Eliminar pedido

module.exports = router;
