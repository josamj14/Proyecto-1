const pool = require('../../db/mongoClient');

// Crear un menú
const createMenuService = async (name) => {
  const result = await pool.query('SELECT create_menu($1)', [name]);
  return result;  // Devuelve el resultado de la operación, si es necesario
};

// Obtener todos los menús
const getAllMenusService = async () => {
  const result = await pool.query('SELECT * FROM get_all_menus()');
  return result.rows;  // Devuelve todos los menús
};

// Obtener un menú por ID
const getMenuByIdService = async (menuId) => {
  const result = await pool.query('SELECT * FROM get_menu_by_id($1)', [menuId]);
  return result.rows[0];  // Devuelve el menú con el ID solicitado
};

// Actualizar un menú
const updateMenuService = async (menuId, name) => {
  const result = await pool.query('SELECT update_menu($1, $2)', [menuId, name]);
  return result;  // Devuelve el resultado de la operación, si es necesario
};

// Eliminar un menú
const deleteMenuService = async (menuId) => {
  const result = await pool.query('SELECT delete_menu($1)', [menuId]);
  return result;  // Devuelve el resultado de la operación, si es necesario
};


module.exports = {
  create: createMenuService,
  findAll: getAllMenusService,
  findById: getMenuByIdService,
  update: updateMenuService,
  remove: deleteMenuService,
};