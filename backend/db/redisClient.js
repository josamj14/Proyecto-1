const redis = require("redis");
const client = redis.createClient({
  url: process.env.REDIS_URL,
});

const DB_TYPE = process.env.DB_TYPE;

client.on("connect", () => {
  console.log("Redis conectado exitosamente");
});

client.on("error", (err) => {
  console.error("Error en Redis:", err);
});

(async () => {
  await client.connect();
})();

// Helper para definir prefijo según el tipo de DB
const getPrefixedKey = (key) => `${DB_TYPE}:${key}`;

module.exports = {
  client,
  getPrefixedKey,
};
