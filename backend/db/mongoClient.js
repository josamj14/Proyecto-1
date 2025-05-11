const { MongoClient } = require('mongodb');

// USE CONTAINER NAMES (like mongos1) — NOT localhost
const uri = 'mongodb://mongos1/?serverSelectionTimeoutMS=3000&directConnection=true';
const client = new MongoClient(uri);

async function connectMongo() {
  try{
    await client.connect();
  } catch (e) {
    console.error(e);
  }    
  return client.db('restaurant'); // or return client if you want access to client
  }

module.exports = connectMongo; 