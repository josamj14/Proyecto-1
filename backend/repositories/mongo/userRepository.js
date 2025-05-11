const connectMongo = require('../../db/mongoClient');
const { ObjectId } = require('mongodb');

let db;

async function init() {
  db = await connectMongo(); // ✅ this will call the actual function
}

init();

// CREATE
const createUser = async (role, name, email, password) => {
  db = await connectMongo();
  const user = { role, name, email, password };
  const result = await db.collection('users').insertOne(user);
  return { _id: result.insertedId, ...user };
};

// READ ALL
const findAll = async () => {
  db = await connectMongo();
  return await db.collection('users').find({}).toArray();
};

// READ BY ID
const findById = async (id) => {
  db = await connect();
  return await db.collection('users').findOne({ _id: new ObjectId(id) });
};

// LOGIN
const login = async (email) => {
  return await db.collection('users').findOne({ email });
};

// UPDATE
const update = async (id, name, email, password) => {
  const updateFields = {};
  if (name) updateFields.name = name;
  if (email) updateFields.email = email;
  if (password) updateFields.password = password;

  const result = await db.collection('users').findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateFields },
    { returnDocument: 'after' }
  );
  return result.value;
};

// DELETE
const remove = async (id) => {
  const result = await db.collection('users').findOneAndDelete({ _id: new ObjectId(id) });
  return result.value;
};

module.exports = {
  create: createUser,
  findAll,
  findById,
  update,
  remove,
  login,
};
