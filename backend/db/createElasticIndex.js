// db/createElasticIndex.js
const elasticClient = require('./elasticClient');

const createProductIndex = async () => {
  try {
    const exists = await elasticClient.indices.exists({ index: 'products' });

    if (!exists) {
      await elasticClient.indices.create({
        index: 'products',
        body: {
          mappings: {
            properties: {
              name: { type: 'text' },
              description: { type: 'text' },
              menu_id: { type: 'integer' },
              price: { type: 'float' }
            },
          },
        },
      });

      console.log("✅ Índice 'products' creado en ElasticSearch.");
    } else {
      console.log("ℹ️ El índice 'products' ya existe en ElasticSearch.");
    }
  } catch (error) {
    console.error("❌ Error al crear el índice en ElasticSearch:", error.message);
  }
};

module.exports = createProductIndex;
