const router = require('express').Router();
const {
  createProduct,
  getAllProducts
} = require('../controllers/productController.js');


// Crear nuevo producto
router.post('/product', createProduct);


// Obtener todos los productos
router.get('/products', getAllProducts);
module.exports = router;
