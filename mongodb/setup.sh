#!/bin/bash
echo ***********************************************
echo Starting replica set
echo ************************************************

wait_for_mongo() {
  local host=$1
  echo "⏳ Waiting for $host to be ready..."
  until mongosh --host "$host" --quiet --eval "db.adminCommand('ping')" >/dev/null 2>&1; do
    echo "   still waiting for $host..."
    sleep 1
  done
  echo "✅ $host is ready."
}

echo "MongoDB is up. Running scripts..."

wait_for_mongo mongocfg1:27017
mongosh mongodb://mongocfg1:27017 init-config.js 
sleep 5

wait_for_mongo mongors1n1:27017
mongosh mongodb://mongors1n1:27017 init-shard1.js

wait_for_mongo mongors2n1:27017
mongosh mongodb://mongors2n1:27017 init-shard2.js

wait_for_mongo mongors3n1:27017
mongosh mongodb://mongors3n1:27017 init-shard3.js

sleep 5
wait_for_mongo mongos1:27017
mongosh mongodb://mongos1:27017 init.js 
mongosh mongodb://mongos1:27017 data.js

echo "All done!"
exit 0