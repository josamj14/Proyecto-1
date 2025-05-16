const { Client } = require('@elastic/elasticsearch');

const elasticClient = new Client({
  node: 'http://elasticsearch:9200',
  maxRetries: 5,
  requestTimeout: 60000,
  sniffOnStart: true,
});

module.exports = elasticClient;
