// routes/authRoutes.js
const router = require('express').Router();
const authController = require('../controllers/authController');

// Ruta de login
router.post('/loginauth', authController.loginUser);

module.exports = router;
