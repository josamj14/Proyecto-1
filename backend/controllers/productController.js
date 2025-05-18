const { getRepository } = require("../repositories/respositoryFactory");

const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({
    status,
    message,
    data,
  });
};

//  Crear un nuevo producto CONTROLLER
const createProduct = async (req, res, next) => {
  const { name, description, menu_id, price } = req.body;

  try {
    const productRepo = getRepository("product");
    const newProductId = await productRepo.create(name, description, menu_id, price);

    if (!newProductId) {
      return handleResponse(res, 400, "No se pudo crear el producto");
    }

    handleResponse(res, 201, "Product created successfully", { product_id: newProductId });
  } catch (err) {
    console.error("❌ Error al crear producto:", err.message);
    next(err);
  }
};

//  Obtener todos los productos
// const getAllProducts = async (req, res, next) => {
//   try {
//     const products = await productRepo.findAll();
    
//     if (!products.length) {
//       return handleResponse(res, 404, "No products found");
//     }
    
//     handleResponse(res, 200, "Products fetched successfully", products);
//   } catch (err) {
//     console.error("❌ Error al obtener productos:", err.message);
//     next(err);
//   }
// };

const getAllProducts = async (req, res, next) => {
  try {
    const productRepo = getRepository("product");
    const products = await productRepo.findAll();
    handleResponse(res, 200, "Products fetched successfully", products);
  } catch (err) {
    console.error("❌ Error al obtener productos:", err.message);
    next(err);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
};


