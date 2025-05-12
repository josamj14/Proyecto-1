const connectMongo = require('../../db/mongoClient');

let db;

async function init() {
  db = await connectMongo(); // ✅ this will call the actual function
}

init();

// CREATE
const createUser = async (role, username, email, password) => {
  const db = await connectMongo();

  // Find the max current userId (assuming it exists as a number)
  const lastUser = await db.collection('users')
    .find({})
    .sort({ userId: -1 })
    .limit(1)
    .toArray();

  const maxUserId = lastUser.length > 0 ? lastUser[0].userId : 0;

  const newUser = {
    userId: maxUserId + 1,
    role,
    username,
    email,
    password
  };

  const result = await db.collection('users').insertOne(newUser);
  return { _id: result.insertedId, ...newUser };
};

// READ ALL
const findAll = async () => {
  return await db.collection('users').find({}).toArray();
};

// READ BY ID
const findById = async (id) => {
  return await db.collection('users').findOne({ userId: Number(id) });
};

// LOGIN
const login = async (em) => {
  return await db.collection('users').findOne({ email: em });
};

// UPDATE
const update = async (userId, name, email, password) => {
  const updateFields = {};
  if (name) updateFields.username = name;
  if (email) updateFields.email = email;
  if (password) updateFields.password = password;

  const result = await db.collection('users').updateOne(
    { userId: Number(userId) },
    { $set: updateFields },
    { returnDocument: 'after' }
  );
  return result.matchedCount>0;
};

// DELETE
const remove = async (userId) => {
  const result = await db.collection('users').deleteOne({ userId: Number(userId) });
  return result.deletedCount>0;
};

module.exports = {
  create: createUser,
  findAll,
  findById,
  update,
  remove,
  login,
};
