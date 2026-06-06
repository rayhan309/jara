export function buildCustomerProfiles(orders = []) {
  const map = new Map();

  orders.forEach((order) => {
    const phone = order.customer?.phone?.trim();
    if (!phone) return;

    const existing = map.get(phone) || {
      id: phone,
      phone,
      name: order.customer?.name || "—",
      address: order.customer?.address || "—",
      orderCount: 0,
      activeOrderCount: 0,
      totalSpent: 0,
      lastOrderAt: null,
      firstOrderAt: null,
      orders: [],
    };

    existing.orderCount += 1;
    existing.orders.push(order);

    if (order.status !== "cancelled") {
      existing.activeOrderCount += 1;
      existing.totalSpent += order.pricing?.total || 0;
    }

    const orderDate = new Date(order.createdAt);

    if (!existing.lastOrderAt || orderDate > new Date(existing.lastOrderAt)) {
      existing.lastOrderAt = order.createdAt;
      existing.name = order.customer?.name || existing.name;
      existing.address = order.customer?.address || existing.address;
    }

    if (!existing.firstOrderAt || orderDate < new Date(existing.firstOrderAt)) {
      existing.firstOrderAt = order.createdAt;
    }

    map.set(phone, existing);
  });

  return Array.from(map.values())
    .map((customer) => ({
      ...customer,
      orders: customer.orders.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    }))
    .sort(
      (a, b) => new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime()
    );
}

export function buildCustomerStats(customers = []) {
  const repeatCustomers = customers.filter((customer) => customer.orderCount > 1).length;
  const totalSpent = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);

  return {
    totalCustomers: customers.length,
    repeatCustomers,
    totalSpent,
  };
}

export function formatCustomerSpent(amount) {
  return `৳${Number(amount || 0).toLocaleString()}`;
}
