const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const db_name = process.env.MONGO_DB;

const client = new MongoClient(uri);

async function connectMongo() {
  try{
    await client.connect();
  } catch (e) {
    console.error(e);
  }    
  return client.db(db_name); 
  }

module.exports = connectMongo; 