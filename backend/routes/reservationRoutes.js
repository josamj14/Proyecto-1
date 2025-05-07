const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
} = require('../controllers/reservationController.js');

// Rutas CRUD para reservas

router.get('/reservations', verifyToken, (req, res, next) => {
  req.role = ['client', 'admin']; // Acceso permitido solo para 'client' o 'admin'
  next();
}, getAllReservations);               // Obtener todas las reservas

router.get('/reservations/:id', verifyToken, (req, res, next) => {
  req.role = ['client', 'admin']; // Acceso permitido solo para 'client' o 'admin'
  next();
}, getReservationById);               // Obtener reserva por ID

router.post('/reservations', verifyToken, (req, res, next) => {
  req.role = 'admin';  // Solo los admins pueden crear reservas
  next();
}, createReservation);               // Crear nueva reserva

router.put('/reservations/:id', verifyToken, (req, res, next) => {
  req.role = 'admin';  // Solo los admins pueden actualizar reservas
  next();
}, updateReservation);            // Actualizar reserva

router.delete('/reservations/:id', verifyToken, (req, res, next) => {
  req.role = 'admin';  // Solo los admins pueden eliminar reservas
  next();
}, deleteReservation);         // Eliminar reserva

module.exports = router;
