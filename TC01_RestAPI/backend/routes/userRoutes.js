const router = require('express').Router();

const {
    createUser,
    deleteUser,
    getAllUsers,
    getUserById,
    updateUser,
} = require("../controllers/userController.js");

// Mios
const { loginUser } = require("../controllers/loginController.js"); 
const verifyToken = require('../middleware/verifyToken');  // Importamos el middleware de verificación de token

// Ruta de login que genera el JWT

router.post("/login", loginUser);

// Ruta para registrar un nuevo usuario (no requiere autenticación)
router.post("/user", createUser);  // No protegida, ya que se usa para registro

// Rutas protegidas que requieren autenticación
router.get("/user", verifyToken, (req, res, next) => {
  req.role = ['client', 'admin']; // Acceso permitido solo para 'client' o 'admin'
  next();
}, getAllUsers);

router.get("/user/:id", verifyToken, (req, res, next) => {
  req.role = ['client', 'admin'];  // Acceso permitido solo para 'client' o 'admin'
  next();
}, getUserById);

router.put("/user/:id", verifyToken, (req, res, next) => {
  req.role = 'admin';  // Solo los admins pueden actualizar usuarios
  next();
}, updateUser);

router.delete("/user/:id", verifyToken, (req, res, next) => {
  req.role = 'admin';  // Solo los admins pueden eliminar usuarios
  next();
}, deleteUser);

module.exports = router;








