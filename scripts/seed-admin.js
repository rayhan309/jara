const fs = require("fs");
const path = require("path");
const { randomBytes, scryptSync } = require("crypto");
const { MongoClient } = require("mongodb");

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  const raw = fs.readFileSync(envPath, "utf8");
  return Object.fromEntries(
    raw
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
      })
  );
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(String(password), salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const env = loadEnv();
  const username = String(env.ADMINUSERNAME || "admin").trim().toLowerCase();
  const password = String(env.ADMINPASS || "");

  if (!env.MONGODB_URI || !env.DBNAME) {
    throw new Error("MONGODB_URI and DBNAME are required in .env");
  }
  if (!username || !password) {
    throw new Error("ADMINUSERNAME and ADMINPASS are required in .env");
  }

  const client = new MongoClient(env.MONGODB_URI);
  await client.connect();

  try {
    const users = client.db(env.DBNAME).collection("admin_users");
    await users.createIndex({ username: 1 }, { unique: true });

    const now = new Date();
    const existing = await users.findOne({ username });
    const doc = {
      name: "Super Admin",
      role: "super_admin",
      passwordHash: hashPassword(password),
      active: true,
      updatedAt: now,
    };

    if (existing) {
      await users.updateOne({ _id: existing._id }, { $set: doc });
      console.log(`Updated super admin: ${username}`);
    } else {
      await users.insertOne({
        username,
        ...doc,
        createdAt: now,
      });
      console.log(`Inserted super admin: ${username}`);
    }
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
