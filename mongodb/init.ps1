

# Wait for all containers to stabilize
Write-Host ' Waiting for containers to be ready...'
Start-Sleep -Seconds 20

# Step 2: Initialize Config Server Replica Set
Write-Host 'Initializing config server replica set...'
docker exec -it mongocfg1 mongosh --eval @"
rs.initiate({
  _id: 'mongors1conf',
  configsvr: true,
  members: [
    { _id: 0, host: 'mongocfg1' },
    { _id: 1, host: 'mongocfg2' },
    { _id: 2, host: 'mongocfg3' }
  ]
})
"@

Start-Sleep -Seconds 5

# Step 3: Initialize Shard 1
Write-Host ' Initializing shard 1 (mongors1)...'
docker exec -it mongors1n1 mongosh --eval @"
rs.initiate({
  _id: 'mongors1',
  members: [
    { _id: 0, host: 'mongors1n1' },
    { _id: 1, host: 'mongors1n2' },
    { _id: 2, host: 'mongors1n3' }
  ]
})
"@

Start-Sleep -Seconds 5

# Step 3: Initialize Shard 2
Write-Host ' Initializing shard 2 (mongors2)...'
docker exec -it mongors2n1 mongosh --eval @"
rs.initiate({
  _id: 'mongors2',
  members: [
    { _id: 0, host: 'mongors2n1' },
    { _id: 1, host: 'mongors2n2' },
    { _id: 2, host: 'mongors2n3' }
  ]
})
"@

Start-Sleep -Seconds 5

# Step 3: Initialize Shard 3
Write-Host ' Initializing shard 3 (mongors3)...'
docker exec -it mongors3n1 mongosh --eval @"
rs.initiate({
  _id: 'mongors3',
  members: [
    { _id: 0, host: 'mongors3n1' },
    { _id: 1, host: 'mongors3n2' },
    { _id: 2, host: 'mongors3n3' }
  ]
})
"@

Start-Sleep -Seconds 10

# Step 4: Connect to mongos and add shards
Write-Host ' Adding shards to the cluster...'
docker exec -it mongos1 mongosh --eval @"

sh.addShard('mongors1/mongors1n1:27017');
sh.addShard('mongors2/mongors2n1:27017');
sh.addShard('mongors3/mongors3n1:27017');
"@


Start-Sleep -Seconds 10

# Step 5: Sharding my collections
Write-Host ' Sharding collections...'
docker exec -it mongos1 mongosh --eval @"

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
"@

Start-Sleep -Seconds 10
