const connectMongo = require('../../db/mongoClient');

let db;

async function init() {
  db = await connectMongo();
}

init();

// Get all reservations
const findAll = async () => {
  return await db.collection('reservation').find({}).toArray();
};

// Find reservation by ID
const findById = async (id) => {
  return await db.collection('reservation').findOne({ reservationId: Number(id) });
};

// Create a new reservation
const create = async (restaurantId, tableId, userId, capacity, datetime) => {
  const lastReservation = await db.collection('reservation')
    .find({})
    .sort({ reservationId: -1 })
    .limit(1)
    .toArray();

  const maxReservationId = lastReservation.length > 0 ? lastReservation[0].reservationId : 0;

  const newReservation = {
    reservationId: maxReservationId + 1,
    restaurantId: Number(restaurantId),
    tableId: Number(tableId),
    userId: Number(userId),
    capacity: Number(capacity),
    datetime: new Date(datetime)
  };

  const result = await db.collection('reservation').insertOne(newReservation);
  return { _id: result.insertedId, ...newReservation };
};

const update = async (reservationId, tableId, userId, capacity, datetime)=> {
    const updatedFields = {};
    if (tableId) updatedFields.tableId = tableId;
    if (userId) updatedFields.userId = userId;
    if (capacity) updatedFields.capacity = capacity;
    if (datetime) updatedFields.datetime = datetime;

    const result = await db.collection('reservation').updateOne(
        {reservationId: Number(reservationId)},
        { $set: updatedFields },
        { returnDocument: 'after' }
    )
    return result.matchedCount>0;
};

// Delete reservation by ID
const remove = async (reservationId) => {
  const result = await db.collection('reservation').deleteOne({ reservationId: Number(reservationId) });
  return result.deletedCount > 0;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};
