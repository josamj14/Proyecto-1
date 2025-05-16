import { faker } from '@faker-js/faker';
import pkg from 'pg';
import { MongoClient } from 'mongodb';

const { Client } = pkg;

const POSTGRES = {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
};

const MONGO_URL = process.env.MONGO_URI;
const MONGO_DB = process.env.MONGO_DB;

const NUM_USERS = 50;
const NUM_RESTAURANTS = 20;
const NUM_ORDERS = 50;
const NUM_RESERVATIONS = 50;
const MENUS = ['Regular Menu', 'Executive Menu', 'Dessert Menu', 'Breakfast Menu'];

const pgClient = new Client(POSTGRES);
const mongoClient = new MongoClient(MONGO_URL);

async function run() {
  await pgClient.connect();
  const mongo = mongoClient.db(MONGO_DB);

  console.log("🧹 Limpiando bases de datos...");
  await pgClient.query(`TRUNCATE Order_Line, Reservation, "Order", "Table", Menu_Restaurant, Products, Menu, Restaurant, Users RESTART IDENTITY CASCADE`);
  await Promise.all([
    mongo.collection('users').deleteMany({}),
    mongo.collection('menu').deleteMany({}),
    mongo.collection('restaurant').deleteMany({}),
    mongo.collection('order').deleteMany({}),
    mongo.collection('reservation').deleteMany({})
  ]);

  console.log("📋 Insertando menús...");
  const menuIds = {};
  for (const name of MENUS) {
    const res = await pgClient.query(`INSERT INTO Menu ("Name") VALUES ($1) RETURNING Menu_ID`, [name]);
    menuIds[name] = res.rows[0].menu_id;
    await mongo.collection('menu').insertOne({ name, products: [] });
  }

  console.log("👤 Insertando usuarios...");
  const userIds = [];
  for (let i = 0; i < NUM_USERS; i++) {
    const role = faker.helpers.arrayElement(['Client', 'Admin']);
    const username = faker.internet.userName();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const res = await pgClient.query(
      `INSERT INTO Users ("Role", Username, Email, "Password") VALUES ($1, $2, $3, $4) RETURNING User_ID`,
      [role, username, email, password]
    );
    const userId = res.rows[0].user_id;
    userIds.push(userId);
    await mongo.collection('users').insertOne({ userId, role, username, email, password });
  }

  console.log("🏢 Insertando restaurantes...");
  const restaurantIds = [];
  for (let i = 0; i < NUM_RESTAURANTS; i++) {
    const name = `Restaurante ${faker.location.city()}`;
    const address = faker.location.streetAddress();
    const res = await pgClient.query(
      `INSERT INTO Restaurant ("Name", "Address") VALUES ($1, $2) RETURNING Restaurant_ID`,
      [name, address]
    );
    const restaurantId = res.rows[0].restaurant_id;
    restaurantIds.push(restaurantId);

    const menuSubset = faker.helpers.arrayElements(Object.values(menuIds), 2);
    for (const mid of menuSubset) {
      await pgClient.query(`INSERT INTO Menu_Restaurant (Restaurant_ID, Menu_ID) VALUES ($1, $2)`, [restaurantId, mid]);
    }

    const tables = [];
    for (let j = 0; j < 4; j++) {
      const res = await pgClient.query(`INSERT INTO "Table" (Restaurant_ID, Capacity) VALUES ($1, $2) RETURNING Table_ID`, [restaurantId, 4]);
      tables.push({ tableId: res.rows[0].table_id, capacity: 4 });
    }

    await mongo.collection('restaurant').insertOne({
      restaurantId,
      name,
      address,
      menuIds: menuSubset,
      tables
    });
  }

  console.log("🍔 Insertando productos...");
  const productIds = [];
  const menus = await pgClient.query(`SELECT Menu_ID, "Name" FROM Menu`);
  for (const { menu_id, Name } of menus.rows) {
    for (let i = 0; i < 3; i++) {
      const name = `${faker.commerce.product()} ${faker.commerce.productAdjective()}`;
      const description = faker.commerce.productDescription();
      const price = parseFloat(faker.commerce.price({ min: 5, max: 15 }));
      const res = await pgClient.query(
        `INSERT INTO Products ("Name", "Description", Menu_ID, Price) VALUES ($1, $2, $3, $4) RETURNING Product_ID`,
        [name, description, menu_id, price]
      );
      productIds.push({ productId: res.rows[0].product_id, price });
      await mongo.collection('menu').updateOne(
        { name: Name },
        { $push: { products: { productId: res.rows[0].product_id, name, description, price } } }
      );
    }
  }

  console.log("🧾 Insertando órdenes...");
  for (let i = 0; i < NUM_ORDERS; i++) {
    const userId = faker.helpers.arrayElement(userIds);
    const restaurantId = faker.helpers.arrayElement(restaurantIds);
    const datetime = faker.date.recent({ days: 30 });
    const res = await pgClient.query(
      `INSERT INTO "Order" ("Datetime", User_ID, Restaurant_ID) VALUES ($1, $2, $3) RETURNING Order_ID`,
      [datetime, userId, restaurantId]
    );
    const orderId = res.rows[0].order_id;

    const items = faker.helpers.arrayElements(productIds, 2);
    for (const item of items) {
      await pgClient.query(
        `INSERT INTO Order_Line (Order_ID, Product_ID, Price) VALUES ($1, $2, $3)`,
        [orderId, item.productId, item.price]
      );
    }

    await mongo.collection('order').insertOne({
      orderId,
      restaurantId,
      datetimne: datetime,
      userId,
      orderLines: items.map(p => ({ productId: p.productId, price: p.price }))
    });
  }

  console.log("📅 Insertando reservas...");
  for (let i = 0; i < NUM_RESERVATIONS; i++) {
    const userId = faker.helpers.arrayElement(userIds);
    const restaurantId = faker.helpers.arrayElement(restaurantIds);
    const tableIdRes = await pgClient.query(
      `SELECT Table_ID FROM "Table" WHERE Restaurant_ID = $1 ORDER BY random() LIMIT 1`,
      [restaurantId]
    );
    const tableId = tableIdRes.rows[0].table_id;
    const datetime = faker.date.soon({ days: 30 });
    const res = await pgClient.query(
      `INSERT INTO Reservation ("Datetime", User_ID, Capacity, Table_ID, Restaurant_ID) VALUES ($1, $2, $3, $4, $5) RETURNING Reservation_ID`,
      [datetime, userId, 4, tableId, restaurantId]
    );
    await mongo.collection('reservation').insertOne({
      reservationId: res.rows[0].reservation_id,
      restaurantId,
      tableId,
      userId,
      capacity: 4,
      datetime
    });
  }

  await pgClient.end();
  await mongoClient.close();
  console.log("✅ Carga completa en PostgreSQL y MongoDB.");
}

run().catch(err => {
  console.error("❌ Error:", err);
});
