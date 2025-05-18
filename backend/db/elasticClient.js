// const { Client } = require('@elastic/elasticsearch');
// require('dotenv').config();

// const elasticClient = new Client({
//   node: process.env.ELASTIC_URL || 'http://elasticsearch:9200',
//   maxRetries: 5,
//   requestTimeout: 60000,
//   sniffOnStart: true,
//   // headers: {
//   //   'Content-Type': 'application/json', 
//   //   'Accept': 'application/json'
//   // }
// });

// module.exports = elasticClient;

const { Client } = require('@elastic/elasticsearch');

const elasticClient = new Client({
  node: 'http://elasticsearch:9200',
  maxRetries: 5,
  requestTimeout: 60000,
  sniffOnStart: true
});

module.exports = elasticClient;
