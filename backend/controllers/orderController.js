const { getRepository } = require("../repositories/respositoryFactory");
const ordRepo = getRepository("order");
  
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
      await ordRepo.create(userId, datetime, restaurantId);
      handleResponse(res, 201, "Order created successfully");
    } catch (err) {
      next(err);
    }
  };
  
  // Obtener todos los pedidos
  const getAllOrders = async (req, res, next) => {
    try {
      const orders = await ordRepo.findAll();
      handleResponse(res, 200, "Orders fetched successfully", orders);
    } catch (err) {
      next(err);
    }
  };
  
  // Obtener un pedido por ID
  const getOrderById = async (req, res, next) => {
    try {
      const order = await ordRepo.findById(req.params.id);
      if (!order) return handleResponse(res, 404, "Order not found");
      handleResponse(res, 200, "Order fetched successfully", order);
    } catch (err) {
      next(err);
    }
  };
  
  // Actualizar un pedido
  const updateOrder = async (req, res, next) => {
    const { userId, datetime, restaurantId } = req.body;
    try {
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
  