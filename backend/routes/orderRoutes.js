const router = require('express').Router();

const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} = require('../controllers/orderController.js');

// Rutas CRUD para pedidos
router.get('/orders', getAllOrders);               // Obtener todos los pedidos
router.get('/orders/:id', getOrderById);           // Obtener pedido por ID
router.post('/orders', createOrder);               // Crear nuevo pedido
router.put('/orders/:id', updateOrder);            // Actualizar pedido
router.delete('/orders/:id', deleteOrder);         // Eliminar pedido

module.exports = router;
