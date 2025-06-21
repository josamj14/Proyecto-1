import { faker } from '@faker-js/faker';
import pkg from 'pg';

const { Client } = pkg;

const POSTGRES = {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
};

const NUM_USERS = 500;
const NUM_RESTAURANTS = 500;
const NUM_ORDERS = 500;
const NUM_RESERVATIONS = 500;
const MENUS = ['Kids Menu', 'Lunch Menu', 'Dinner Menu', 'Happy Hour Menu', 'Seasonal Menu', 'Chefs Special Menu', 'Tasting Menu', 'Drinks Menu', 'Cocktail Menu', 'Wine Menu', 'Beer Menu', 'Vegan Menu', 'Vegetarian Menu', 'Gluten-Free Menu', 'Allergen-Free Menu', 'Low-Carb Menu', 'Low-Calorie Menu', 'High-Protein Menu', 'Keto Menu', 'Paleo Menu', 'Holiday Menu', 'Thanksgiving Menu', 'Christmas Menu', 'New Year Menu', 'Easter Menu', 'Valentine’s Menu', 'Mother’s Day Menu', 'Father’s Day Menu', 'Fourth of July Menu', 'Weekend Brunch Menu', 'Midweek Special Menu', 'Late Night Menu', 'Afternoon Tea Menu', 'Buffet Menu', 'À la Carte Menu', 'Prix Fixe Menu', 'Set Menu', 'Mini Menu', 'Snack Menu', 'Bistro Menu', 'Grill Menu', 'Barbecue Menu', 'Seafood Menu', 'Steakhouse Menu', 'Italian Menu', 'Mexican Menu', 'Chinese Menu', 'Japanese Menu', 'Thai Menu', 'Indian Menu', 'French Menu', 'Greek Menu', 'Mediterranean Menu', 'American Menu', 'Fusion Menu', 'Rustic Menu', 'Gourmet Menu', 'Fine Dining Menu', 'Casual Dining Menu', 'Family Menu', 'Express Menu', 'Takeout Menu', 'Delivery Menu', 'Drive-Thru Menu', 'Pickup Menu', 'Online Order Menu', 'Mobile Order Menu', 'Special Events Menu', 'Birthday Menu', 'Anniversary Menu', 'Corporate Menu', 'Catering Menu', 'Banquet Menu', 'Outdoor Menu', 'Patio Menu', 'Poolside Menu', 'Room Service Menu', 'Hotel Menu', 'Spa Menu', 'Wellness Menu', 'Detox Menu', 'Smoothie Menu', 'Juice Menu', 'Coffee Menu', 'Tea Menu', 'Bakery Menu', 'Pastry Menu', 'Ice Cream Menu', 'Sundae Menu', 'Frozen Dessert Menu', 'Comfort Food Menu', 'Street Food Menu', 'Tapas Menu', 'Appetizer Menu', 'Soup Menu', 'Salad Menu', 'Sandwich Menu', 'Pizza Menu', 'Pasta Menu', 'Noodle Menu', 'Rice Menu', 'Grain Bowl Menu', 'Sushi Menu', 'Dim Sum Menu'];


const pgClient = new Client(POSTGRES);

async function run() {
  await pgClient.connect();

  console.log("Limpiando bases de datos...");
  await pgClient.query(`TRUNCATE Order_Line, Reservation, "Order", "Table", Menu_Restaurant, Products, Menu, Restaurant, Users RESTART IDENTITY CASCADE`);

  console.log("Insertando menús...");
  const menuIds = {};
  for (const name of MENUS) {
    const res = await pgClient.query(`INSERT INTO Menu ("Name") VALUES ($1) RETURNING Menu_ID`, [name]);
    menuIds[name] = res.rows[0].menu_id;
  }

  console.log("Insertando usuarios...");
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
  }

  console.log("Insertando restaurantes...");
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
  }

  console.log("Insertando productos...");
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
    }
  }

  console.log("Insertando órdenes...");
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
  }

  console.log(" Insertando reservas...");
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
  }

  await pgClient.end();
  console.log("✅ Carga completa en PostgreSQL.");
}

run().catch(err => {
  console.error("Error:", err);
});
