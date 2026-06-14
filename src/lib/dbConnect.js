const { MongoClient, ServerApiVersion } = require("mongodb");
import { ensureMongoIndexes } from "@/lib/mongodbIndexes";

const uri = process.env.MONGODB_URI;
const dbname = process.env.BDNAME || process.env.DBNAME;

if (!uri) {
  throw new Error("Please add your Mongo URI to .env");
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 10,
};

let clientPromise;

function createClientPromise() {
  const client = new MongoClient(uri, options);
  return client.connect();
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientPromise();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = createClientPromise();
}

function isTopologyClosedError(error) {
  return (
    error?.name === "MongoTopologyClosedError" ||
    String(error?.message || "").includes("Topology is closed")
  );
}

function resetClientPromise() {
  clientPromise = createClientPromise();

  if (process.env.NODE_ENV === "development") {
    global._mongoClientPromise = clientPromise;
  }

  return clientPromise;
}

async function getClient() {
  try {
    const client = await clientPromise;

    if (process.env.NODE_ENV === "development") {
      try {
        await client.db(dbname).command({ ping: 1 });
      } catch (error) {
        if (isTopologyClosedError(error)) {
          return resetClientPromise();
        }
        throw error;
      }
    }

    return client;
  } catch (error) {
    if (process.env.NODE_ENV !== "development") {
      throw error;
    }

    return resetClientPromise();
  }
}

export async function dbConnect(collectionName, options = {}) {
  const { skipIndexes = false } = options;

  if (!skipIndexes) {
    await ensureMongoIndexes();
  }

  const client = await getClient();
  return client.db(dbname).collection(collectionName);
}
