const connectMongo = require('../../db/mongoClient');

let db;

async function init() {
  db = await connectMongo();
}

init();

// Get all orders
const findAll = async () => {
  return await db.collection('order').find({}).toArray();
};

// Find an order by ID
const findById = async (id) => {
  return await db.collection('order').findOne({ orderId: Number(id) });
};

// Create a new order
const create = async (restaurantId, userId, datetimne, orderLines = []) => {
  const lastOrder = await db.collection('order')
    .find({})
    .sort({ orderId: -1 })
    .limit(1)
    .toArray();

  const maxOrderId = lastOrder.length > 0 ? lastOrder[0].orderId : 0;

  const newOrder = {
    orderId: maxOrderId + 1,
    restaurantId: Number(restaurantId),
    userId: Number(userId),
    datetimne: new Date(datetimne), // note: the field is "datetimne", not "datetime"
    orderLines: orderLines.map(line => ({
      menuId: Number(line.menuId),
      productId: Number(line.productId),
      price: Number(line.price)
    }))
  };

  const result = await db.collection('order').insertOne(newOrder);
  return { _id: result.insertedId, ...newOrder };
};

const update = async (orderId, restaurantId, datetime, userId)=> {
    const updatedFields = {};
    if (restaurantId) updatedFields.restaurantId = restaurantId;
    if (datetime) updatedFields.datetime = datetime;
    if (userId) updatedFields.userId = userId;

    const result = await db.collection('order').updateOne(
        {orderId: Number(orderId)},
        { $set: updatedFields },
        { returnDocument: 'after' }
    )
    return result.matchedCount>0;
};

// Delete an order by ID
const remove = async (orderId) => {
  const result = await db.collection('order').deleteOne({ orderId: Number(orderId) });
  return result.deletedCount > 0;
};

// Add a new order line to an existing order
const addOrderLine = async (orderId, menuId, productId, price) => {
  const newOrderLine = {
    menuId: Number(menuId),
    productId: Number(productId),
    price: Number(price)
  };

  const result = await db.collection('order').updateOne(
    { orderId: Number(orderId) },
    { $push: { orderLines: newOrderLine } }
  );

  return result.matchedCount > 0;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  addOrderLine
};
