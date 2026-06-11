export function formatRelativeTime(value) {
  if (!value) return "—";

  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function formatCurrency(amount) {
  return `৳${Number(amount || 0).toLocaleString()}`;
}

import {
  isDeliveredOrderStatus,
  isExcludedOrderStatus,
  isNewOrderStatus,
} from "@/lib/orderHelpers";

export function buildDashboardStats(orders = [], products = []) {
  const activeOrders = orders.filter((order) => !isExcludedOrderStatus(order.status));
  const totalRevenue = activeOrders.reduce(
    (sum, order) => sum + (order.pricing?.total || 0),
    0
  );
  const pendingOrders = orders.filter((order) => isNewOrderStatus(order.status)).length;
  const deliveredOrders = orders.filter((order) => isDeliveredOrderStatus(order.status)).length;
  const lowStockProducts = products.filter((product) => {
    const qty = product.inventory?.quantity ?? 0;
    return qty <= 5 || product.inventory?.stock_status === "low_stock";
  }).length;
  const outOfStock = products.filter(
    (product) => product.inventory?.stock_status === "out_of_stock"
  ).length;

  const uniqueCustomers = new Set(
    orders.map((order) => order.customer?.phone).filter(Boolean)
  ).size;

  const avgOrderValue = activeOrders.length
    ? Math.round(totalRevenue / activeOrders.length)
    : 0;

  return {
    totalRevenue,
    totalOrders: orders.length,
    pendingOrders,
    deliveredOrders,
    totalProducts: products.length,
    lowStockProducts,
    outOfStock,
    uniqueCustomers,
    avgOrderValue,
  };
}

export function buildMonthlyChartData(orders = []) {
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

  orders
    .filter((order) => !isExcludedOrderStatus(order.status))
    .forEach((order) => {
      const created = new Date(order.createdAt);
      const bucket = buckets.find(
        (entry) =>
          entry.year === created.getFullYear() && entry.monthIndex === created.getMonth()
      );

      if (bucket) {
        bucket.revenue += order.pricing?.total || 0;
        bucket.orders += 1;
      }
    });

  return buckets.map(({ month, revenue, orders: orderCount }) => ({
    month,
    revenue,
    orders: orderCount,
  }));
}

export function buildRecentActivities(orders = [], products = []) {
  const activities = [];

  orders.slice(0, 4).forEach((order) => {
    activities.push({
      id: `order-${order._id}`,
      text: `Order ${order.order_number} placed`,
      time: order.createdAt,
      icon: "order",
    });
  });

  products
    .filter((product) => {
      const qty = product.inventory?.quantity ?? 0;
      return qty <= 5 || product.inventory?.stock_status === "low_stock";
    })
    .slice(0, 2)
    .forEach((product) => {
      activities.push({
        id: `stock-${product._id}`,
        text: `Low stock — ${product.title_en || product.title_bn}`,
        time: product.updatedAt || product.createdAt,
        icon: "stock",
      });
    });

  return activities.slice(0, 5);
}
