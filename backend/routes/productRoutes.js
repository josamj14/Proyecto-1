const router = require('express').Router();

const {
  createProduct
} = require('../controllers/productController.js');

// Rutas CRUD para menús
router.post('/product', createProduct); // Crear nuevo producto

module.exports = router;