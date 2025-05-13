# Implementación de Caché con Redis en API REST

## **Descripción General**
La integración de Redis en nuestra API REST permite optimizar el rendimiento de las consultas a la base de datos PostgreSQL o Mongo. Mediante el uso de un middleware de caché, las respuestas frecuentes se almacenan temporalmente en Redis, reduciendo el tiempo de respuesta en futuras solicitudes.

INSERTAR DIAGRAMA ESTRCUTURAL CUANDO LO TERMINE

## **Infraestructura en Docker Compose**
La configuración para Redis se define en el archivo `docker-compose.yml`, el cual especifica un contenedor dedicado para Redis:

```yaml
redis:
  container_name: redis
  image: redis:latest
  ports:
    - "6379:6379"
  networks:
    - backend-network
```


## **Conexión a Redis en el Proyecto**
La conexión a Redis se realiza mediante un cliente de Redis en un archivo especifico:

```javascript
// db/redisClient.js
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
const getPrefixedKey = (key) => `${DB_TYPE}:${key}`;
module.exports = {
  client,
  getPrefixedKey,
};
```

---

## **Middleware de Caché**
Para evitar duplicación de código, se desarrolló un middleware reutilizable, esto para que en cada controlador del backend sea más unificado y evite duplicación de trabajo.

```javascript
// middlewares/cacheMiddleware.js
const { client: redisClient, getPrefixedKey } = require("../db/redisClient");

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

    console.log("Cache miss");
    next();
  } catch (err) {
    console.error("Error al acceder al caché:", err);
    next();
  }
};

module.exports = cacheMiddleware;
```

---

## 🚀 **Integración en Controladores**
A modo de ejemplo, vamos a integrar el caché en el controlador de menus.
En el controlador de menús, el caché se implementa de la siguiente forma:
Es en el controlador donde se manjea la política de expiración que en nuestro caso es 1 hora.

```javascript
// controllers/menuController.js
const { getRepository } = require("../repositories/repositoryFactory");
const menuRepo = getRepository("menu");
const { client: redisClient, getPrefixedKey } = require("../db/redisClient");

const getAllMenus = async (req, res, next) => {
  try {
    const menus = await menuRepo.findAll();
    res.status(200).json({
      status: 200,
      message: "Menus fetched successfully",
      data: menus,
    });

    // Guardar en caché
    const cacheKey = getPrefixedKey("all_menus");
    await redisClient.set(cacheKey, JSON.stringify(menus), {
      EX: 60 * 60, // Expira en 1 hora
    });
  } catch (err) {
    console.error("Error en getAllMenus:", err.message);
    next(err);
  }
};

module.exports = {
  getAllMenus,
};
```

---

## ✅ **Resultado Esperado**
- Primera consulta a `/api/menus` → **Cache Miss** y respuesta desde PostgreSQL/Mongo.
- Segunda consulta → **Cache Hit** y respuesta desde Redis.
- Clave almacenada en Redis: `postgres:all_menus`.

Para validar en Redis:
```bash
docker exec -it redis redis-cli
127.0.0.1:6379> KEYS *
```

Con eso se ven todas las keys que han sido guardadas hasta el momento.



