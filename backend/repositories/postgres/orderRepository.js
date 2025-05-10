const pool = require('../../db');

// Crear un pedido
const createOrderService = async (userId, datetime, restaurantId) => {
  const result = await pool.query('SELECT create_order($1, $2, $3)', [userId, datetime, restaurantId]);
  return result;  // Devuelve el resultado de la operación, si es necesario
};

// Obtener todos los pedidos
const getAllOrdersService = async () => {
  const result = await pool.query('SELECT * FROM get_all_orders()');
  return result.rows;  // Devuelve todos los pedidos
};

// Obtener un pedido por ID
const getOrderByIdService = async (orderId) => {
  const result = await pool.query('SELECT * FROM get_order_by_id($1)', [orderId]);
  return result.rows[0];  // Devuelve el pedido con el ID solicitado
};

// Actualizar un pedido
const updateOrderService = async (orderId, userId, datetime, restaurantId) => {
  const result = await pool.query('SELECT update_order($1, $2, $3, $4)', [orderId, userId, datetime, restaurantId]);
  return result;  // Devuelve el resultado de la operación, si es necesario
};

// Eliminar un pedido
const deleteOrderService = async (orderId) => {
  const result = await pool.query('SELECT delete_order($1)', [orderId]);
  return result;  // Devuelve el resultado de la operación, si es necesario
};

module.exports = {
  create: createOrderService,
  findAll: getAllOrdersService,
  findById: getOrderByIdService,
  update: updateOrderService,
  remove: deleteOrderService,
};