const { getRepository } = require("../repositories/respositoryFactory");

  const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({
      status,
      message,
      data,
    });
  };

  const createProduct = async (req, res, next) => {
    const { name, descrip, menu_id, price} = req.body;
    try {
      const userRepo = getRepository("product");
      const newUser = await userRepo.create(name, descrip, menu_id, price);
      handleResponse(res, 201, "Product created successfully", newUser);
    } catch (err) {
      next(err);
    }
  };

const getAllProducts = async (req, res, next) => {
  try {
    const productRepo = getRepository("product");
    const products = await productRepo.findAll();
    handleResponse(res, 200, "Products fetched successfully", products);
  } catch (err) {
    console.error("Error al obtener productos:", err.message);
    next(err);
  }
};

  module.exports = {
    createProduct,
    getAllProducts
};