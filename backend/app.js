const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const orderRoutes = require('./routes/orderRoutes');
const menuRoutes = require('./routes/menuRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const checkJwt = require('./middleware/auth0');
const createProductIndex = require('./db/createElasticIndex');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas públicas (sin autenticación)
app.use('/api', authRoutes);
app.use('/api', userRoutes);


// 🚀 Crear el índice de productos al iniciar
(async () => {
  await createProductIndex();
})();
console.log("Este log esta despues del create index");
// app.use('/api', checkJwt); // Si quieres proteger el resto

app.use('/api', restaurantRoutes);
app.use('/api', reservationRoutes);
app.use('/api', orderRoutes);
app.use('/api', menuRoutes);
app.use('/api', productRoutes);

// DB startup (PostgreSQL or MongoDB)
(async () => {
  const dbType = process.env.DB_TYPE || 'postgres';
  if (dbType === 'postgres') {
    const pool = require('./db/pgClient'); // asegúrate que sea el archivo correcto
    try {
      await pool.connect(); // solo necesario para PostgreSQL
      console.log(' Connected to PostgreSQL');
    } catch (err) {
      console.error(' PostgreSQL connection failed:', err);
    }
  } else if (dbType === 'mongo') {
    const connectMongo = require('./db/mongoClient');
    try {
      await connectMongo(); // MongoClient se conecta al invocarlo
      console.log(' Connected to MongoDB');
    } catch (err) {
      console.error('MongoDB connection failed:', err);
    }
  }
})();

// Ruta de prueba
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Hello World!',
  });
});

// Server Running
app.listen(port, () => {
  console.log(` Server is running on http://localhost:${port}`);
});
