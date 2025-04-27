const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv'); 
const pool = require('./db');
const userRoutes = require('./routes/userRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes'); //Todo lo de Restaurant
const reservationRoutes = require('./routes/reservationRoutes'); //Entidad reservation
const orderRoutes = require('./routes/orderRoutes');  //entidad de orders
const menuRoutes = require('./routes/menuRoutes');  //LOS MENUS 



dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
pool.connect();
//Middleware
app.use(cors());
app.use(express.json());

// Rutas públicas (sin autenticación)

app.use('/api', userRoutes);

//Routes
//app.use('/api', checkJwt);  // Protege todas las rutas a continuación

app.use('/api', restaurantRoutes); //Rutas de restaurantes
app.use('/api', reservationRoutes);  //Rutas de las reservaciones
app.use('/api', orderRoutes); // Rutas de pedidos
app.use('/api', menuRoutes); // Rutas de menús
//Error


// Testing postgres connection
app.get("/", async (req, res) => {
    try {
        console.log("Start");
        const result = await pool.query("SELECT current_database()");
        console.log("result", result.rows);
        res.send(`The database name is : ${result.rows[0].current_database}`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Hello World!'
    });
});

//Server Running
app.listen(port, () => {
    console.log(`Server is running on localhost:${port}`);
});

//all routes will be here 