const router = require('express').Router();
const {
  createMenu,
  getAllMenus,
  getMenuById,
  updateMenu,
  deleteMenu,
} = require('../controllers/menuController.js');

const cacheMiddleware = require('../middleware/cacheMiddleware');

// Rutas CRUD para menús
router.get('/menus', cacheMiddleware(() => "all_menus"), getAllMenus); // Listado de menús
router.get('/menus/:id', cacheMiddleware((req) => `menu:${req.params.id}`), getMenuById); // Menú por ID
router.post('/menus', createMenu); // Crear nuevo menú
router.put('/menus/:id', updateMenu); // Actualizar menú
router.delete('/menus/:id', deleteMenu); // Eliminar menú

module.exports = router;
