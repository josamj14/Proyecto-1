const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const {
  createMenu,
  getAllMenus,
  getMenuById,
  updateMenu,
  deleteMenu,
} = require('../controllers/menuController.js');

// Rutas CRUD para menús

router.get('/menus', verifyToken, (req, res, next) => {
  req.role = ['client', 'admin']; // Acceso permitido solo para 'client' o 'admin'
  next();
}, getAllMenus);               // Obtener todos los menús

router.get('/menus/:id', verifyToken, (req, res, next) => {
  req.role = ['client', 'admin']; // Acceso permitido solo para 'client' o 'admin'
  next();
}, getMenuById);               // Obtener menú por ID

router.post('/menus', verifyToken, (req, res, next) => {
  req.role = 'admin';  // Solo los admins pueden crear menús
  next();
}, createMenu);               // Crear nuevo menú

router.put('/menus/:id', verifyToken, (req, res, next) => {
  req.role = 'admin';  // Solo los admins pueden actualizar menús
  next();
}, updateMenu);            // Actualizar menú

router.delete('/menus/:id', verifyToken, (req, res, next) => {
  req.role = 'admin';  // Solo los admins pueden eliminar menús
  next();
}, deleteMenu);         // Eliminar menú

module.exports = router;
