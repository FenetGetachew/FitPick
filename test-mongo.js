const { MongoClient } = require('mongodb');

async function connectToMongo() {
    const url = 'mongodb://localhost:27017';
    const client = new MongoClient(url);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB!');
        
        const db = client.db('fitpick');
        const users = await db.collection('users').find().toArray();
        
        console.log('Users in database:', users);
        
    } catch (error) {
        console.log('❌ Error:', error);
    } finally {
        await client.close();
    }
}

connectToMongo();
