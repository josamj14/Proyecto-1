const connectMongo = require('../../db/mongoClient');

let db;

async function init() {
  db = await connectMongo(); 
}

init();

const addProduct = async (name, descrip, menuId, price) => {
  const menu = await db.collection('menu').findOne({ menuId: Number(menuId) });

  if (!menu) return false;

  const nextProductId =
    menu.products && menu.products.length > 0
      ? Math.max(...menu.products.map((p) => p.productId)) + 1
      : 0;

  const newProduct = {
    productId: nextProductId,
    name,
    descrip,
    price: Number(price),
  };

  const result = await db.collection('menu').updateOne(
    { menuId: Number(menuId) },
    { $push: { products: newProduct } }
  );

  return result.matchedCount > 0;
};

module.exports = {
  create: addProduct
};