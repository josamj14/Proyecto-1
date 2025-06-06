const pool = require('../../db/pgClient');

//CREATE
const createUserService = async (role, name, email, password) => {
  const result = await pool.query('SELECT register_user($1, $2, $3, $4)', [role, name, email, password]);
  return result.rows[0];
};

//READ
const getAllUsersService = async () => {
  const result = await pool.query('SELECT * FROM get_all_users()');
  return result.rows;
};
const getUserByIdService = async (id) => {
  const result = await pool.query('SELECT * FROM get_user_details($1)', [id]);
  return result.rows[0]; 
};
async function loginUser(email) {
  const res = await pool.query('SELECT * FROM login_user($1)', [email]);
  return res.rows[0]; // Devuelve el usuario con la contraseña para validación
}

//UPDATE
const updateUserService = async (id, name, email, password) => {
  const result = await pool.query('SELECT update_user($1, $2, $3, $4)', [id, name, email, password]);
  return result.rows[0];
};

//DELETE
const deleteUserService = async (id) => {
  const result = await pool.query('SELECT delete_user($1)', [id]);
  return result.rows[0];
};

module.exports = {
  create: createUserService,
  findAll: getAllUsersService,
  findById: getUserByIdService,
  update: updateUserService,
  remove: deleteUserService,
  login: loginUser, 
};
