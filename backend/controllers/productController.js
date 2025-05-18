const { getRepository } = require("../repositories/respositoryFactory");
//const createProductIndex = require("../db/createElasticIndex");
//const elasticClient = require("../db/elasticClient");

const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({
    status,
    message,
    data,
  });
};

// **Crear un nuevo producto y enviar a Elasticsearch**
const createProduct = async (req, res, next) => {
  const { name, description, menu_id, price } = req.body;

  try {
    const productRepo = getRepository("product");
    const newProductId = await productRepo.create(name, description, menu_id, price);

    if (!newProductId) {
      return handleResponse(res, 400, "No se pudo crear el producto");
    }

    // //  **Verificación de Headers:**
    // const headers = req.headers;
    // if (!headers['content-type'] || !headers['accept']) {
    //   headers['Content-Type'] = 'application/vnd.elasticsearch+json; compatible-with=8';
    //   headers['Accept'] = 'application/vnd.elasticsearch+json; compatible-with=8';
    // }

    // // **Enviar a Elasticsearch**
    // await elasticClient.index({
    //   index: 'products',
    //   document: {
    //     name,
    //     description,
    //     menu_id,
    //     price,
    //   },
    //   headers: headers,
    // });

    // console.log(" Producto creado e indexado en Elasticsearch");

    // handleResponse(res, 201, "Product created and indexed successfully", { product_id: newProductId });

  } catch (err) {
    console.error("Error al crear producto ", err.message);
    next(err);
  }
};

// **Obtener todos los productos**
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
  getAllProducts,
};
