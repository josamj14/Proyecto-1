const { getRepository } = require("../repositories/respositoryFactory");

const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({
    status,
    message,
    data,
  });
};

const productRepo = getRepository("product");

// 🔄 Crear un nuevo producto
const createProduct = async (req, res, next) => {
  const { name, description, menu_id, price } = req.body;

  try {
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

// 🔍 Obtener todos los productos
const getAllProducts = async (req, res, next) => {
  try {
    const products = await productRepo.findAll();
    if (products.length === 0) {
      return handleResponse(res, 404, "No se encontraron productos");
    }
    handleResponse(res, 200, "Products fetched successfully", products);
  } catch (err) {
    console.error("❌ Error al obtener productos:", err.message);
    next(err);
  }
};

// 🔍 Obtener un producto por ID
const getProductById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const product = await productRepo.findById(id);
    if (!product) {
      return handleResponse(res, 404, "Producto no encontrado");
    }
    handleResponse(res, 200, "Product fetched successfully", product);
  } catch (err) {
    console.error("❌ Error al obtener el producto:", err.message);
    next(err);
  }
};

// 🔄 Actualizar un producto
const updateProduct = async (req, res, next) => {
  const { name, description, menu_id, price } = req.body;
  const { id } = req.params;

  try {
    const updatedProduct = await productRepo.update(id, name, description, menu_id, price);

    if (!updatedProduct) {
      return handleResponse(res, 404, "Producto no encontrado");
    }

    handleResponse(res, 200, "Product updated successfully", updatedProduct);
  } catch (err) {
    console.error("❌ Error al actualizar producto:", err.message);
    next(err);
  }
};

// 🗑️ Eliminar un producto
const deleteProduct = async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedProduct = await productRepo.remove(id);

    if (!deletedProduct) {
      return handleResponse(res, 404, "Producto no encontrado");
    }

    handleResponse(res, 200, "Product deleted successfully");
  } catch (err) {
    console.error("❌ Error al eliminar producto:", err.message);
    next(err);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
