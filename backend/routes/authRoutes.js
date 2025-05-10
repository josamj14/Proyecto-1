// routes/authRoutes.js
const router = require('express').Router();
const authController = require('../controllers/authController');

// Ruta de login
router.post('/login', authController.loginUser);

module.exports = router;
