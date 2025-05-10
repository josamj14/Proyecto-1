const pool = require('../../db');


// Crear restaurante
const createRestaurantService = async (name, address) => {
  const result = await pool.query('SELECT create_restaurant($1, $2)', [name, address]);
  return result;  // Si el stored procedure no devuelve datos, puedes devolver un mensaje o un resultado genérico.
};

// Obtener todos los restaurantes
const getAllRestaurantsService = async () => {
  const result = await pool.query('SELECT * FROM get_all_restaurants()');
  return result.rows;  // Devuelve todos los restaurantes
};

// Obtener un restaurante por ID
const getRestaurantByIdService = async (id) => {
  const result = await pool.query('SELECT * FROM get_restaurant_by_id($1)', [id]);
  return result.rows[0];  // Devuelve el primer restaurante encontrado por ID
};

// Actualizar restaurante
const updateRestaurantService = async (id, name, address) => {
  const result = await pool.query('SELECT update_restaurant($1, $2, $3)', [id, name, address]);
  return result;  // Si el stored procedure no devuelve datos, puedes devolver un mensaje o un resultado genérico.
};

// Eliminar restaurante
const deleteRestaurantService = async (id) => {
  const result = await pool.query('SELECT delete_restaurant($1)', [id]);
  return result;  // Si el stored procedure no devuelve datos, puedes devolver un mensaje o un resultado genérico.
};


module.exports = {
  create: createRestaurantService,
  findAll: getAllRestaurantsService,
  findById: getRestaurantByIdService,
  update: updateRestaurantService,
  remove: deleteRestaurantService,
};