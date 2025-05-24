##This script was made to verify the shard distribution in the database

Write-Host ' Checking data distribution'
docker exec -it mongos1 mongosh --eval @"
db = db.getSiblingDB('restaurant');

db.users.getShardDistribution();
"@

Start-Sleep -Seconds 5

docker exec -it mongos1 mongosh --eval @"
db = db.getSiblingDB('restaurant');

db.menu.getShardDistribution();
"@

Start-Sleep -Seconds 5

docker exec -it mongos1 mongosh --eval @"
db = db.getSiblingDB('restaurant');

db.restaurant.getShardDistribution();
"@

Start-Sleep -Seconds 5

docker exec -it mongos1 mongosh --eval @"
db = db.getSiblingDB('restaurant');

db.order.getShardDistribution();
"@

Start-Sleep -Seconds 5

docker exec -it mongos1 mongosh --eval @"
db = db.getSiblingDB('restaurant');

db.reservation.getShardDistribution();
"@