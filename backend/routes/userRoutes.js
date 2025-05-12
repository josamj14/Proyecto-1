const router = require('express').Router();
const {
    createUser,
    deleteUser,
    getAllUsers,
    getUserById,
    updateUser,
} = require("../controllers/userController.js");

const cacheMiddleware = require('../middleware/cacheMiddleware.js');

// Rutas CRUD para usuarios
router.get("/user", cacheMiddleware(() => "all_users"), getAllUsers);             // Obtener todos los usuarios
router.get("/user/:id", cacheMiddleware((req) => `user:${req.params.id}`), getUserById);  // Obtener usuario por ID
router.post("/user", createUser);               // Crear nuevo usuario
router.put("/user/:id", updateUser);            // Actualizar usuario
router.delete("/user/:id", deleteUser);         // Eliminar usuario

module.exports = router;
