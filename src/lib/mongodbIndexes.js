import { dbConnect } from "@/lib/dbConnect";

let indexesEnsured = false;
let indexesPromise = null;

export async function ensureMongoIndexes() {
  if (indexesEnsured) return;
  if (indexesPromise) return indexesPromise;

  indexesPromise = (async () => {
    try {
      const [orders, products, categories, sessions, users, productAttributes] = await Promise.all([
        dbConnect("orders", { skipIndexes: true }),
        dbConnect("products", { skipIndexes: true }),
        dbConnect("categories", { skipIndexes: true }),
        dbConnect("admin_sessions", { skipIndexes: true }),
        dbConnect("admin_users", { skipIndexes: true }),
        dbConnect("product_attributes", { skipIndexes: true }),
      ]);

      await Promise.all([
        orders.createIndex({ createdAt: -1 }),
        orders.createIndex({ status: 1, createdAt: -1 }),
        orders.createIndex({ "customer.phone": 1 }),
        products.createIndex({ createdAt: -1 }),
        products.createIndex({ slug: 1 }),
        products.createIndex({ category_id: 1 }),
        products.createIndex({ category_slug: 1 }),
        categories.createIndex({ sort_order: 1 }),
        categories.createIndex({ slug: 1 }, { unique: true, sparse: true }),
        sessions.createIndex({ token: 1 }, { unique: true }),
        sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
        users.createIndex({ username: 1 }, { unique: true }),
        productAttributes.createIndex({ slug: 1 }, { unique: true }),
        productAttributes.createIndex({ sort_order: 1 }),
      ]);

      indexesEnsured = true;
    } catch (error) {
      console.error("ensureMongoIndexes error:", error);
      indexesPromise = null;
    }
  })();

  return indexesPromise;
}
