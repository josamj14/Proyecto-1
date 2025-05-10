const router = require('express').Router();

const {
  createMenu,
  getAllMenus,
  getMenuById,
  updateMenu,
  deleteMenu,
} = require('../controllers/menuController.js');

// Rutas CRUD para menús
router.get('/menus', getAllMenus);               // Obtener todos los menús
router.get('/menus/:id', getMenuById);           // Obtener menú por ID
router.post('/menus', createMenu);               // Crear nuevo menú
router.put('/menus/:id', updateMenu);            // Actualizar menú
router.delete('/menus/:id', deleteMenu);         // Eliminar menú

module.exports = router;
