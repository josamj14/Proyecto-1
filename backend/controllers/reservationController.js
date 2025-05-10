const { getRepository } = require("../repositories/respositoryFactory");
const resvRepo = getRepository("reservation");
  
  // Respuesta estandarizada
  const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({
      status,
      message,
      data,
    });
  };
  
  // Crear una nueva reserva
  const createReservation = async (req, res, next) => {
    const { userId, datetime, capacity, tableId, restaurantId } = req.body;
    try {
      await resvRepo.create(userId, datetime, capacity, tableId, restaurantId);
      handleResponse(res, 201, "Reservation created successfully");
    } catch (err) {
      next(err);
    }
  };
  
  // Obtener todas las reservas
  const getAllReservations = async (req, res, next) => {
    try {
      const reservations = await resvRepo.findAll();
      handleResponse(res, 200, "Reservations fetched successfully", reservations);
    } catch (err) {
      next(err);
    }
  };
  
  // Obtener una reserva por ID
  const getReservationById = async (req, res, next) => {
    try {
      const reservation = await resvRepo.findById(req.params.id);
      if (!reservation) return handleResponse(res, 404, "Reservation not found");
      handleResponse(res, 200, "Reservation fetched successfully", reservation);
    } catch (err) {
      next(err);
    }
  };
  
  // Actualizar una reserva
  const updateReservation = async (req, res, next) => {
    const { userId, datetime, capacity, tableId, restaurantId } = req.body;
    try {
      const updatedReservation = await resvRepo.update(req.params.id, userId, datetime, capacity, tableId, restaurantId);
      if (!updatedReservation) return handleResponse(res, 404, "Reservation not found");
      handleResponse(res, 200, "Reservation updated successfully", updatedReservation);
    } catch (err) {
      next(err);
    }
  };
  
  // Eliminar una reserva
  const deleteReservation = async (req, res, next) => {
    try {
      const deletedReservation = await resvRepo.remove(req.params.id);
      if (!deletedReservation) return handleResponse(res, 404, "Reservation not found");
      handleResponse(res, 200, "Reservation deleted successfully");
    } catch (err) {
      next(err);
    }
  };
  
  module.exports = {
    createReservation,
    getAllReservations,
    getReservationById,
    updateReservation,
    deleteReservation,
  };
  