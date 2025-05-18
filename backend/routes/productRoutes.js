const router = require('express').Router();

const {
  createProduct,
  getAllProducts
} = require('../controllers/productController.js');

// Rutas CRUD para menús
router.post('/product', createProduct); // Crear nuevo producto
router.get('/products', getAllProducts);

module.exports = router;