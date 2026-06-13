const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

function getMongodbUri() {
  const paths = [path.join(__dirname, ".env.local"), path.join(__dirname, ".env")];
  for (const p of paths) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, "utf-8");
      for (const line of content.split("\n")) {
        const parts = line.split("=");
        if (parts[0].trim() === "MONGODB_URI") {
          return parts.slice(1).join("=").trim().replace(/['"]/g, "");
        }
      }
    }
  }
  return null;
}

async function run() {
  const uri = getMongodbUri();
  if (!uri) {
    console.error("MONGODB_URI not found");
    return;
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("nexa_e-commerce");
    const products = await db.collection("products").find({}).toArray();
    console.log("Total products:", products.length);
    products.forEach(p => {
      console.log(`ID: ${p._id}, Title (EN): ${p.title_en}, Title (BN): ${p.title_bn}, Slug: ${p.slug}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
