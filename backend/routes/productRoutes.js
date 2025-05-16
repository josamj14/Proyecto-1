const router = require('express').Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController.js');

// 🔄 Crear nuevo producto
router.post('/product', createProduct);

// 🔍 Obtener todos los productos
router.get('/products', getAllProducts);

// 🔍 Obtener producto por ID
router.get('/products/:id', getProductById);

// 🔄 Actualizar un producto
router.put('/products/:id', updateProduct);

// 🗑️ Eliminar un producto
router.delete('/products/:id', deleteProduct);

module.exports = router;
