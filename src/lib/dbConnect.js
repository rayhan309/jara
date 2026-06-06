const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGODB_URI;
const dbname = process.env.BDNAME || process.env.DBNAME;

if (!uri) {
    throw new Error('Please add your Mongo URI to .env');
}

// 1. Set optimized connection options
const options = {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    maxPoolSize: 10,
    minPoolSize: 5,
};

let client;

// 2. Connection Caching in Development
// This prevents creating infinite db connection pools on hot reloads
if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClient) {
        global._mongoClient = new MongoClient(uri, options);
    }
    client = global._mongoClient;
} else {
    // In production, keep creating the standard client (cached naturally by Node container lifetime)
    client = new MongoClient(uri, options);
}

// Ensure the client attempts to connect behind the scenes
// Next.js handles the async queueing automatically for .db() calls.
client.connect().catch((error) => console.error("Global MongoDB Connection Error: ", error));

export const dbConnect = (cname) => {
    return client.db(dbname).collection(cname);
};