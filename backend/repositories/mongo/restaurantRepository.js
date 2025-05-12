const connectMongo = require('../../db/mongoClient');

let db;

async function init() {
  db = await connectMongo(); // ✅ this will call the actual function
}

init();

const findAll = async () => {
    return await db.collection('restaurant').find({}).toArray();
};

const findById = async (id) => {
    return await db.collection('restaurant').findOne({restaurantId: Number(id)})
};

const create = async (name, address) => {
    const lastRestaurant = await db.collection('restaurant')
    .find({})
    .sort({ restaurantId: -1 })
    .limit(1)
    .toArray();

    const maxRestId = lastRestaurant.length > 0 ? lastRestaurant[0].restaurantId : 0;

    const newRestaurant = {
        restaurantId: maxRestId + 1,
        name,
        address
    };

    const result = await db.collection('restaurant').insertOne(newRestaurant);
    return{_id: result.insertedId, ...newRestaurant}

};

const update = async (restaurantId, name, address)=> {
    const updatedFields = {};
    if (name) updatedFields.name = name;
    if (address) updatedFields.address = address;

    const result = await db.collection('restaurant').updateOne(
        {restaurantId: Number(restaurantId)},
        { $set: updatedFields },
        { returnDocument: 'after' }
    )
    return result.matchedCount>0;
};

const remove = async (restaurantId) => {
  const result = await db.collection('restaurant').deleteOne({ restaurantId: Number(restaurantId) });
  return result.deletedCount > 0;
};

const addTable = async (restaurantId, tableId, capacity) => {
  const newTable = { tableId, capacity };

  const result = await db.collection('restaurant').updateOne(
    {restaurantId: Number(restaurantId)},
    { $push: { tables: newTable } },
    { returnDocument: 'after' }
  );

    return result.matchedCount>0;
};

const removeTable = async (restaurantId, tableId) => {
  const result = await db.collection('restaurant').updateOne(
    { restaurantId: Number(restaurantId) },
    { $pull: { tables: { tableId: tableId } } }
  );

  return result.matchedCount > 0;
};

const addMenuId = async (restaurantId, menuId) => {
  const result = await db.collection('restaurant').updateOne(
    { restaurantId: Number(restaurantId) },
    { $addToSet: { menuIds: menuId } },
    { returnOriginal: false }
  );

  return result.matchedCount > 0;
};

const removeMenuId = async (restaurantId, menuId) => {
  const result = await db.collection('restaurant').updateOne(
    { restaurantId: Number(restaurantId) },
    { $pull: { menuIds: menuId } }
  );

  return result.matchedCount > 0;
};


module.exports = {
    findAll,
    create, 
    findById,
    update,
    remove,
    addMenuId,
    removeMenuId,
    addTable,
    removeTable
}
