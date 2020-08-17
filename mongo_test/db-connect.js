const MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/Zsls', (error, client) => {
    if(error) {
        return console.log('Unable to connect to database...');
    }

    console.log("connected to DB");

    const db = client.db("Zsls");
    db.collection("Human").insertOne({
        name: 'Jupeter',
        tel: 8201012345678,
        nationality: 'Korea'
    }, (error, result) => {
        if(error) {
            console.log('Something wrong...');
        }
        
        console.log(JSON.stringify(result.ops, undefined, 2));
    });
    
    client.close();
});