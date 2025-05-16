const pool = require('../../db/pgClient');

// 🔄 Crear un nuevo producto
const createProductService = async (name, description, menu_id, price) => {
  try {
    const result = await pool.query(
      'SELECT create_product($1::VARCHAR, $2::TEXT, $3::INT, $4::DECIMAL) AS product_id',
      [name, description, menu_id, price]
    );

    console.log("📌 Resultado de PostgreSQL:", result.rows);
    return result.rows[0]?.product_id || null;
  } catch (error) {
    console.error("❌ Error al crear el producto:", error.message);
    throw error;
  }
};

module.exports = {
  create: createProductService
};
