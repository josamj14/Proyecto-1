const connectMongo = require('../../db/mongoClient');

let db;

async function init() {
  db = await connectMongo(); // ✅ initialize DB connection
}

init();

// Get all menus
const findAll = async () => {
  return await db.collection('menu').find({}).toArray();
};

// Find a menu by ID
const findById = async (id) => {
  return await db.collection('menu').findOne({ menuId: Number(id) });
};

// Create a new menu
const create = async (name, products = []) => {
  const lastMenu = await db.collection('menu')
    .find({})
    .sort({ menuId: -1 })
    .limit(1)
    .toArray();

  const maxMenuId = lastMenu.length > 0 ? lastMenu[0].menuId : 0;

  const newMenu = {
    menuId: maxMenuId + 1,
    name,
    products: products.map((product, index) => ({
      productId: index,
      name: product.name,
      description: product.description,
      price: Number(product.price),
    })),
  };

  const result = await db.collection('menu').insertOne(newMenu);
  return { _id: result.insertedId, ...newMenu };
};

// Update menu name
const update = async (menuId, name) => {
  const result = await db.collection('menu').updateOne(
    { menuId: Number(menuId) },
    { $set: { name } }
  );
  return result.matchedCount > 0;
};

// Delete a menu
const remove = async (menuId) => {
  const result = await db.collection('menu').deleteOne({ menuId: Number(menuId) });
  return result.deletedCount > 0;
};

// Add a product to a menu
const addProduct = async (menuId, name, description, price) => {
  const menu = await db.collection('menu').findOne({ menuId: Number(menuId) });

  if (!menu) return false;

  const nextProductId =
    menu.products && menu.products.length > 0
      ? Math.max(...menu.products.map((p) => p.productId)) + 1
      : 0;

  const newProduct = {
    productId: nextProductId,
    name,
    description,
    price: Number(price),
  };

  const result = await db.collection('menu').updateOne(
    { menuId: Number(menuId) },
    { $push: { products: newProduct } }
  );

  return result.matchedCount > 0;
};

// Update a product inside a menu
const updateProduct = async (menuId, productId, updates) => {
  const updateFields = {};
  if (updates.name) updateFields['products.$.name'] = updates.name;
  if (updates.description) updateFields['products.$.description'] = updates.description;
  if (updates.price !== undefined) updateFields['products.$.price'] = Number(updates.price);

  const result = await db.collection('menu').updateOne(
    { menuId: Number(menuId), 'products.productId': Number(productId) },
    { $set: updateFields }
  );

  return result.matchedCount > 0;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  addProduct,
  updateProduct
};
