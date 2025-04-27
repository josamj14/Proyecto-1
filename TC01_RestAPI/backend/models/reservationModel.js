const pool = require('../db');

// Crear una nueva reserva
const createReservationService = async (userId, datetime, capacity, tableId, restaurantId) => {
  const result = await pool.query('SELECT create_reservation($1, $2, $3, $4, $5)', [userId, datetime, capacity, tableId, restaurantId]);
  return result;  // Devuelve el resultado de la operación, si es necesario
};

// Obtener todas las reservas
const getAllReservationsService = async () => {
  const result = await pool.query('SELECT * FROM get_all_reservations()');
  return result.rows;  // Devuelve todas las reservas
};

// Obtener una reserva por ID
const getReservationByIdService = async (reservationId) => {
  const result = await pool.query('SELECT * FROM get_reservation_by_id($1)', [reservationId]);
  return result.rows[0];  // Devuelve la reserva con el ID solicitado
};

// Actualizar una reserva
const updateReservationService = async (reservationId, userId, datetime, capacity, tableId, restaurantId) => {
  const result = await pool.query('SELECT update_reservation($1, $2, $3, $4, $5, $6)', [reservationId, userId, datetime, capacity, tableId, restaurantId]);
  return result;  // Devuelve el resultado de la operación, si es necesario
};

// Eliminar una reserva
const deleteReservationService = async (reservationId) => {
  const result = await pool.query('SELECT delete_reservation($1)', [reservationId]);
  return result;  // Devuelve el resultado de la operación, si es necesario
};

module.exports = {
  createReservationService,
  getAllReservationsService,
  getReservationByIdService,
  updateReservationService,
  deleteReservationService,
};
