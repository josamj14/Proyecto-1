

# Test 1: Obtain all posts by user id 
Write-Host ' Obtain all posts by user id 2 '

docker exec -it mongos1 mongosh --eval @"
db = db.getSiblingDB('socialnet');
let posts = db.posts.find({ userId: 2 });
print('Posts of user 2:', JSON.stringify(posts.toArray(), null, 2));
print(posts.explain('executionStats').executionStats.executionStages.shards);
"@

Start-Sleep -Seconds 10

# Test 2: Obtain all posts by user id 
Write-Host ' Obtain all posts by user id 4000 '

docker exec -it mongos1 mongosh --eval @"
db = db.getSiblingDB('socialnet');
let posts = db.posts.find({ userId: 4000 });
print('Posts of user 4000:', JSON.stringify(posts.toArray(), null, 2));
print(posts.explain('executionStats').executionStats.executionStages.shards);
"@


Start-Sleep -Seconds 10 

# Test 3: Obtain all comments made by x user
Write-Host ' Obtain all coments made by an user, this should cover all shards'

docker exec -it mongos1 mongosh --eval @"
db = db.getSiblingDB('socialnet');
let comments = db.comments.find({ userId: 123 });
print('Comentarios hechos por el usuario 123:');
printjson(comments.toArray());
print(comments.explain('executionStats').executionStats.executionStages.shards);
"@







