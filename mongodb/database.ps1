# Step 6: Adding data
Write-Host ' Adding data...'
docker exec -it mongos1 mongosh --eval @"
db = db.getSiblingDB('restaurant');

for (let i = 0; i < 50; i++) {
  db.users.insertOne({
    userId: i,
    role: 'Client',
    username: 'user' + i,
    email: 'user' + i + '@example.com',
    password: 'pass' + i
  });
}
"@

docker exec -it mongos1 mongosh --eval @"
db = db.getSiblingDB('restaurant');

for (let j = 0; j < 50; j++) {
  let products = [];
  for (let i = 0; i < 3; i++) {
    products.push({
      productId: i,
      name: 'burger' + i,
      description: 'juicy burger',
      price: 8.99
    });
  }

  db.menu.insertOne({
    menuId: j,
    name: 'menu' + j,
    products: products
  });
}

for (let k = 0; k < 50; k++) {
  db.restaurant.insertOne({
    restaurantId: k,
    name: 'cool restaurant' + k,
    address: k + 'th Street',
    menuIds: Array.from({ length: 3 }, () => Math.floor(Math.random() * 51)),
    tables: [
      {tableId: 1, capacity: 4},
      { tableId: 2, capacity: 4},
      { tableId: 3, capacity: 4},
      { tableId: 4, capacity: 4}
    ]
  });
}
"@

docker exec -it mongos1 mongosh --eval @"
db = db.getSiblingDB('restaurant');

for (let j = 0; j < 50; j++) {
  db.order.insertOne({
    orderId: j,
    restaurantId: Math.floor(Math.random() * 51),
    datetimne: new Date(),
    userId: Math.floor(Math.random() * 51),
    orderLines:[
      { menuId: j, productId: 1, price: 9.88 },
      { menuId: j, productId: 2, price: 9.88 },
      { menuId: j, productId: 0, price: 9.88 }
    ]
  });
}

for (let k = 0; k < 50; k++) {
  db.reservation.insertOne({
    reservationId: k,
    restaurantId: k,
    tableId: k,
    userId: k,
    capacity: 4,
    datetime: new Date()
  });
}
"@

