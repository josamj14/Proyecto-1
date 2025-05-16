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

  module.exports = {
    createProduct
};