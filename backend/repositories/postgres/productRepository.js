const pool = require('../../db/pgClient');

const createProductService = async (name, descrip, menu_id, price) => {
  const result = await pool.query('SELECT create_product($1::VARCHAR, $2::VARCHAR, $3::INT, $4::DECIMAL)', [name, descrip, menu_id, price]);
  return result.rows[0];
};

module.exports = {
  create: createProductService
};
