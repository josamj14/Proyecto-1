const { getRepository } = require("../repositories/respositoryFactory");

const { client: redisClient, getPrefixedKey } = require("../db/redisClient");

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
    const resvRepo = getRepository("reservation");
    await resvRepo.create(userId, datetime, capacity, tableId, restaurantId);
    handleResponse(res, 201, "Reservation created successfully");
  } catch (err) {
    next(err);
  }
};

// Obtener todas las reservas
const getAllReservations = async (req, res, next) => {
  try {
    const resvRepo = getRepository("reservation");
    // Generar la llave del caché
    const cacheKey = getPrefixedKey("all_reservations");

    // Verificar si ya está en caché
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit para todas las reservas");
      return handleResponse(res, 200, "Reservations fetched successfully (cache)", JSON.parse(cachedData));
    }

    // Cache Miss, ir a la base de datos
    const reservations = await resvRepo.findAll();
    handleResponse(res, 200, "Reservations fetched successfully", reservations);

    // Guardar en Redis
    await redisClient.set(cacheKey, JSON.stringify(reservations), {
      EX: 60 * 60, // Expira en 1 hora
    });

  } catch (err) {
    next(err);
  }
};

// Obtener una reserva por ID 
const getReservationById = async (req, res, next) => {
  try {
    const resvRepo = getRepository("reservation");
    const cacheKey = getPrefixedKey(`reservation:${req.params.id}`);

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit para la reserva con ID ${req.params.id}`);
      return handleResponse(res, 200, "Reservation fetched successfully (cache)", JSON.parse(cachedData));
    }

    const reservation = await resvRepo.findById(req.params.id);
    if (!reservation) return handleResponse(res, 404, "Reservation not found");
    handleResponse(res, 200, "Reservation fetched successfully", reservation);

    await redisClient.set(cacheKey, JSON.stringify(reservation), {
      EX: 60 * 60, // Expira en 1 hora
    });

  } catch (err) {
    next(err);
  }
};

// Actualizar una reserva 
const updateReservation = async (req, res, next) => {
  const { userId, datetime, capacity, tableId, restaurantId } = req.body;
  try {
    const resvRepo = getRepository("reservation");
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
    const resvRepo = getRepository("reservation");
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
