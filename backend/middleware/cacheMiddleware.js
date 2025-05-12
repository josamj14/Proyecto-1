const { client: redisClient, getPrefixedKey } = require("../db/redisClient");

// Middleware de caché
const cacheMiddleware = (keyGenerator) => async (req, res, next) => {
  const cacheKey = getPrefixedKey(keyGenerator(req));

  try {
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log("Cache hit");
      return res.status(200).json({
        status: 200,
        message: "Data fetched from cache",
        data: JSON.parse(cachedData),
      });
    }

    // Si no está en caché, seguimos al controlador
    console.log("Cache miss");
    next();
  } catch (err) {
    console.error("Error al acceder al caché:", err);
    next();
  }
};

module.exports = cacheMiddleware;
