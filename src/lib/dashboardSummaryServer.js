import { cache } from "react";
import { revalidateTag, unstable_cache } from "next/cache";
import { dbConnect } from "@/lib/dbConnect";
import {
  EXCLUDED_ORDER_STATUSES,
  formatDisplayOrderNumber,
} from "@/lib/orderHelpers";

const ORDERS_COLLECTION = "orders";
const PRODUCTS_COLLECTION = "products";
const CACHE_TAG = "dashboard-summary";

const EXCLUDED_STATUSES = EXCLUDED_ORDER_STATUSES;

function buildMonthlyBuckets() {
  const buckets = [];

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    date.setMonth(date.getMonth() - i);

    buckets.push({
      month: date.toLocaleDateString("en-US", { month: "short" }),
      year: date.getFullYear(),
      monthIndex: date.getMonth(),
      revenue: 0,
      orders: 0,
    });
  }

  return buckets;
}

function serializeRecentOrder(order) {
  return {
    _id: order._id.toString(),
    order_number: order.order_number,
    customer: order.customer || {},
    pricing: order.pricing || {},
    status: order.status,
    createdAt: order.createdAt,
  };
}

async function readDashboardSummaryFromDb() {
  const [ordersCol, productsCol] = await Promise.all([
    dbConnect(ORDERS_COLLECTION),
    dbConnect(PRODUCTS_COLLECTION),
  ]);

  const [orderAgg, productAgg, lowStockProducts] = await Promise.all([
    ordersCol
      .aggregate([
        {
          $facet: {
            stats: [
              {
                $group: {
                  _id: null,
                  totalOrders: { $sum: 1 },
                  pendingOrders: {
                    $sum: { $cond: [{ $eq: ["$status", "new"] }, 1, 0] },
                  },
                  deliveredOrders: {
                    $sum: {
                      $cond: [
                        { $in: ["$status", ["out_for_delivery", "delivered"]] },
                        1,
                        0,
                      ],
                    },
                  },
                  activeRevenue: {
                    $sum: {
                      $cond: [
                        { $not: { $in: ["$status", EXCLUDED_STATUSES] } },
                        { $ifNull: ["$pricing.total", 0] },
                        0,
                      ],
                    },
                  },
                  activeOrders: {
                    $sum: {
                      $cond: [{ $not: { $in: ["$status", EXCLUDED_STATUSES] } }, 1, 0],
                    },
                  },
                  phones: { $addToSet: "$customer.phone" },
                },
              },
            ],
            monthly: [
              {
                $match: { status: { $nin: EXCLUDED_STATUSES } },
              },
              {
                $group: {
                  _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                  },
                  revenue: { $sum: { $ifNull: ["$pricing.total", 0] } },
                  orders: { $sum: 1 },
                },
              },
            ],
            recentOrders: [
              { $sort: { createdAt: -1 } },
              { $limit: 5 },
              {
                $project: {
                  order_number: 1,
                  customer: 1,
                  pricing: 1,
                  status: 1,
                  createdAt: 1,
                },
              },
            ],
            activityOrders: [
              { $sort: { createdAt: -1 } },
              { $limit: 4 },
              { $project: { order_number: 1, createdAt: 1 } },
            ],
          },
        },
      ])
      .toArray(),
    productsCol
      .aggregate([
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            lowStockProducts: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $lte: [{ $ifNull: ["$inventory.quantity", 0] }, 5] },
                      { $eq: ["$inventory.stock_status", "low_stock"] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            outOfStock: {
              $sum: {
                $cond: [{ $eq: ["$inventory.stock_status", "out_of_stock"] }, 1, 0],
              },
            },
          },
        },
      ])
      .toArray(),
    productsCol
      .find({
        $or: [
          { "inventory.quantity": { $lte: 5 } },
          { "inventory.stock_status": "low_stock" },
        ],
      })
      .project({ title_en: 1, title_bn: 1, updatedAt: 1, createdAt: 1 })
      .sort({ updatedAt: -1 })
      .limit(2)
      .toArray(),
  ]);

  const orderFacet = orderAgg[0] || {};
  const orderStats = orderFacet.stats?.[0] || {};
  const productStats = productAgg[0] || {};

  const chartBuckets = buildMonthlyBuckets();
  (orderFacet.monthly || []).forEach((entry) => {
    const bucket = chartBuckets.find(
      (item) => item.year === entry._id.year && item.monthIndex + 1 === entry._id.month
    );
    if (bucket) {
      bucket.revenue = entry.revenue || 0;
      bucket.orders = entry.orders || 0;
    }
  });

  const activeOrders = orderStats.activeOrders || 0;
  const totalRevenue = orderStats.activeRevenue || 0;

  const activities = [];

  (orderFacet.activityOrders || []).forEach((order) => {
    activities.push({
      id: `order-${order._id}`,
      text: `Order ${formatDisplayOrderNumber(order.order_number)} placed`,
      time: order.createdAt,
      icon: "order",
    });
  });

  lowStockProducts.forEach((product) => {
    activities.push({
      id: `stock-${product._id}`,
      text: `Low stock — ${product.title_en || product.title_bn}`,
      time: product.updatedAt || product.createdAt,
      icon: "stock",
    });
  });

  activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return {
    stats: {
      totalRevenue,
      totalOrders: orderStats.totalOrders || 0,
      pendingOrders: orderStats.pendingOrders || 0,
      deliveredOrders: orderStats.deliveredOrders || 0,
      totalProducts: productStats.totalProducts || 0,
      lowStockProducts: productStats.lowStockProducts || 0,
      outOfStock: productStats.outOfStock || 0,
      uniqueCustomers: (orderStats.phones || []).filter(Boolean).length,
      avgOrderValue: activeOrders ? Math.round(totalRevenue / activeOrders) : 0,
    },
    chartData: chartBuckets.map(({ month, revenue, orders }) => ({
      month,
      revenue,
      orders,
    })),
    recentOrders: (orderFacet.recentOrders || []).map(serializeRecentOrder),
    activities: activities.slice(0, 5),
  };
}

const getCachedDashboardSummary = unstable_cache(
  readDashboardSummaryFromDb,
  ["dashboard-summary-global"],
  { revalidate: 30, tags: [CACHE_TAG] }
);

export const getDashboardSummary = cache(async () => {
  try {
    return await getCachedDashboardSummary();
  } catch (error) {
    console.error("getDashboardSummary error:", error);
    return {
      stats: {
        totalRevenue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        totalProducts: 0,
        lowStockProducts: 0,
        outOfStock: 0,
        uniqueCustomers: 0,
        avgOrderValue: 0,
      },
      chartData: buildMonthlyBuckets().map(({ month }) => ({ month, revenue: 0, orders: 0 })),
      recentOrders: [],
      activities: [],
    };
  }
});

export function revalidateDashboardSummaryCache() {
  revalidateTag(CACHE_TAG);
}
