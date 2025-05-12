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

// Crear un pedido
const createOrder = async (req, res, next) => {
  const { userId, datetime, restaurantId } = req.body;
  try {
    const ordRepo = getRepository("order");
    await ordRepo.create(userId, datetime, restaurantId);
    handleResponse(res, 201, "Order created successfully");
  } catch (err) {
    next(err);
  }
};

// Obtener todos los pedidos
const getAllOrders = async (req, res, next) => {
  try {
    const ordRepo = getRepository("order");
    // Generar la llave del caché
    const cacheKey = getPrefixedKey("all_orders");

    // Verificar si ya está en caché
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log(" Cache hit para todos los pedidos");
      return handleResponse(res, 200, "Orders fetched successfully (cache)", JSON.parse(cachedData));
    }

    // Cache Miss, ir a la base de datos
    const orders = await ordRepo.findAll();
    handleResponse(res, 200, "Orders fetched successfully", orders);

    // Guardar en Redis
    await redisClient.set(cacheKey, JSON.stringify(orders), {
      EX: 60 * 60, // Expira en 1 hora
    });

  } catch (err) {
    next(err);
  }
};

// Obtener un pedido por ID
const getOrderById = async (req, res, next) => {
  try {
    const ordRepo = getRepository("order");
    // Generar la llave del caché
    const cacheKey = getPrefixedKey(`order:${req.params.id}`);

    // Verificar si ya está en caché
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit para el pedido con ID ${req.params.id}`);
      return handleResponse(res, 200, "Order fetched successfully (cache)", JSON.parse(cachedData));
    }

    // Cache Miss, ir a la base de datos
    const order = await ordRepo.findById(req.params.id);
    if (!order) return handleResponse(res, 404, "Order not found");
    handleResponse(res, 200, "Order fetched successfully", order);

    // Guardar en Redis
    await redisClient.set(cacheKey, JSON.stringify(order), {
      EX: 60 * 60, // Expira en 1 hora
    });

  } catch (err) {
    next(err);
  }
};

// Actualizar un pedido
const updateOrder = async (req, res, next) => {
  const { userId, datetime, restaurantId } = req.body;
  try {
    const ordRepo = getRepository("order");
    const updatedOrder = await ordRepo.update(req.params.id, userId, datetime, restaurantId);
    if (!updatedOrder) return handleResponse(res, 404, "Order not found");
    handleResponse(res, 200, "Order updated successfully", updatedOrder);
  } catch (err) {
    next(err);
  }
};

// Eliminar un pedido
const deleteOrder = async (req, res, next) => {
  try {
    const ordRepo = getRepository("order");
    const deletedOrder = await ordRepo.remove(req.params.id);
    if (!deletedOrder) return handleResponse(res, 404, "Order not found");
    handleResponse(res, 200, "Order deleted successfully");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
