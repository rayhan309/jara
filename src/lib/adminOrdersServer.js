import { cache } from "react";
import { revalidateTag, unstable_cache } from "next/cache";
import { dbConnect } from "@/lib/dbConnect";

const ORDERS_COLLECTION = "orders";
const CACHE_TAG = "admin-orders";

function serializeOrder(order) {
  return {
    ...order,
    _id: order._id.toString(),
  };
}

async function readAdminOrdersFromDb() {
  const ordersCol = await dbConnect(ORDERS_COLLECTION);
  const list = await ordersCol.find({}).sort({ createdAt: -1 }).toArray();
  return list.map(serializeOrder);
}

const getCachedAdminOrders = unstable_cache(
  readAdminOrdersFromDb,
  ["admin-orders-list"],
  { revalidate: 30, tags: [CACHE_TAG] }
);

export const getAdminOrders = cache(async () => {
  try {
    return await getCachedAdminOrders();
  } catch (error) {
    console.error("getAdminOrders error:", error);
    return [];
  }
});

export async function getFreshAdminOrders() {
  try {
    return await readAdminOrdersFromDb();
  } catch (error) {
    console.error("getFreshAdminOrders error:", error);
    return [];
  }
}

export function revalidateAdminOrdersCache() {
  revalidateTag(CACHE_TAG);
  revalidateTag("dashboard-summary");
  revalidateTag("admin-customers");
}
