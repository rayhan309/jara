import { cache } from "react";
import { revalidateTag, unstable_cache } from "next/cache";
import { dbConnect } from "@/lib/dbConnect";
import { EXCLUDED_ORDER_STATUSES } from "@/lib/orderHelpers";

const ORDERS_COLLECTION = "orders";
const CACHE_TAG = "admin-customers";

function serializeCustomerGroup(entry) {
  return {
    id: entry._id,
    phone: entry._id,
    name: entry.name || "—",
    address: entry.address || "—",
    orderCount: entry.orderCount || 0,
    activeOrderCount: entry.activeOrderCount || 0,
    totalSpent: entry.totalSpent || 0,
    lastOrderAt: entry.lastOrderAt,
    firstOrderAt: entry.firstOrderAt,
    orders: (entry.orders || []).map((order) => ({
      ...order,
      _id: String(order._id),
    })),
  };
}

async function readCustomersFromDb() {
  const ordersCol = await dbConnect(ORDERS_COLLECTION);

  const groups = await ordersCol
    .aggregate([
      {
        $match: {
          "customer.phone": { $exists: true, $nin: [null, ""] },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$customer.phone",
          name: { $first: "$customer.name" },
          address: { $first: "$customer.address" },
          orderCount: { $sum: 1 },
          activeOrderCount: {
            $sum: {
              $cond: [{ $not: { $in: ["$status", EXCLUDED_ORDER_STATUSES] } }, 1, 0],
            },
          },
          totalSpent: {
            $sum: {
              $cond: [
                { $not: { $in: ["$status", EXCLUDED_ORDER_STATUSES] } },
                { $ifNull: ["$pricing.total", 0] },
                0,
              ],
            },
          },
          lastOrderAt: { $max: "$createdAt" },
          firstOrderAt: { $min: "$createdAt" },
          orders: {
            $push: {
              _id: "$_id",
              order_number: "$order_number",
              status: "$status",
              createdAt: "$createdAt",
              pricing: { total: "$pricing.total" },
            },
          },
        },
      },
      { $sort: { lastOrderAt: -1 } },
    ])
    .toArray();

  const customers = groups.map(serializeCustomerGroup);

  const repeatCustomers = customers.filter((customer) => customer.orderCount > 1).length;
  const totalSpent = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);

  return {
    customers,
    stats: {
      totalCustomers: customers.length,
      repeatCustomers,
      totalSpent,
    },
  };
}

const getCachedCustomers = unstable_cache(
  readCustomersFromDb,
  ["admin-customers-global"],
  { revalidate: 30, tags: [CACHE_TAG] }
);

export const getAdminCustomers = cache(async () => {
  try {
    return await getCachedCustomers();
  } catch (error) {
    console.error("getAdminCustomers error:", error);
    return { customers: [], stats: { totalCustomers: 0, repeatCustomers: 0, totalSpent: 0 } };
  }
});

export function revalidateCustomersCache() {
  revalidateTag(CACHE_TAG);
}
