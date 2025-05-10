const router = require('express').Router();

const {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
} = require('../controllers/reservationController.js');

// Rutas CRUD para reservas
router.get('/reservations', getAllReservations);               // Obtener todas las reservas
router.get('/reservations/:id', getReservationById);           // Obtener reserva por ID
router.post('/reservations', createReservation);               // Crear nueva reserva
router.put('/reservations/:id', updateReservation);            // Actualizar reserva
router.delete('/reservations/:id', deleteReservation);         // Eliminar reserva

module.exports = router;
