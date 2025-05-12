const router = require('express').Router();
const {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
} = require('../controllers/reservationController.js');

const cacheMiddleware = require('../middlewares/cacheMiddleware');

// Rutas CRUD para reservas
router.get('/reservations', cacheMiddleware(() => "all_reservations"), getAllReservations);             // Obtener todas las reservas
router.get('/reservations/:id', cacheMiddleware((req) => `reservation:${req.params.id}`), getReservationById);  // Obtener reserva por ID
router.post('/reservations', createReservation);               // Crear nueva reserva
router.put('/reservations/:id', updateReservation);            // Actualizar reserva
router.delete('/reservations/:id', deleteReservation);         // Eliminar reserva

module.exports = router;
