sh.addShard('mongors1/mongors1n1:27017');
sh.addShard('mongors2/mongors2n1:27017');
sh.addShard('mongors3/mongors3n1:27017');

sh.enableSharding('restaurant');

db = db.getSiblingDB('restaurant');

db.users.createIndex({userId: 'hashed'});
db.menu.createIndex({menuId: 'hashed'});
db.restaurant.createIndex({restaurantId: 'hashed'});

db.order.createIndex({restaurantId: 1});
db.order.createIndex({datetime: -1});
db.reservation.createIndex({restaurantId: 1});
db.reservation.createIndex({datetime: -1});

sh.shardCollection(
  'restaurant.users',
  {userId: 'hashed'}
);
sh.shardCollection(
  'restaurant.menu',
  {menuId: 'hashed'}
);
sh.shardCollection(
  'restaurant.restaurant',
  {restaurantId: 'hashed'}
);

sh.shardCollection(
  'restaurant.order', 
  {restaurantId:1, datetime:1}
);
sh.shardCollection(
  'restaurant.reservation', 
  {restaurantId:1, datetime:1}
);

// Assign shards to zone tags
sh.addShardTag('mongors1', 'range1');
sh.addShardTag('mongors2', 'range2');
sh.addShardTag('mongors3', 'range3');

// Define zone ranges (non-overlapping)
sh.updateZoneKeyRange('restaurant.order',
  { restaurantId: MinKey, datetime: MinKey },
  { restaurantId: 16, datetime: MinKey },
  'range1'
);
sh.updateZoneKeyRange('restaurant.order',
  { restaurantId: 16, datetime: MinKey },
  { restaurantId: 32, datetime: MinKey },
  'range2'
);
sh.updateZoneKeyRange('restaurant.order',
  { restaurantId: 32, datetime: MinKey },
  { restaurantId: MaxKey, datetime: MaxKey },
  'range3'
);

sh.updateZoneKeyRange('restaurant.reservation',
  { restaurantId: MinKey, datetime: MinKey },
  { restaurantId: 16, datetime: MinKey },
  'range1'
);
sh.updateZoneKeyRange('restaurant.reservation',
  { restaurantId: 16, datetime: MinKey },
  { restaurantId: 32, datetime: MinKey },
  'range2'
);
sh.updateZoneKeyRange('restaurant.reservation',
  { restaurantId: 32, datetime: MinKey },
  { restaurantId: MaxKey, datetime: MaxKey },
  'range3'
);


sh.status();
