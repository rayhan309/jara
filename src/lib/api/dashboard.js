import { adminFetch } from "@/lib/adminFetch";

export const dashboardSummaryKeys = {
  all: ["dashboard-summary"],
  detail: () => [...dashboardSummaryKeys.all, "detail"],
};

export async function fetchDashboardSummary() {
  const response = await adminFetch("/api/admin/dashboard/summary");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch dashboard summary.");
  }

  return {
    stats: data.stats || {},
    chartData: data.chartData || [],
    recentOrders: data.recentOrders || [],
    activities: data.activities || [],
  };
}

export const adminCustomerKeys = {
  all: ["admin-customers"],
  list: () => [...adminCustomerKeys.all, "list"],
};

export async function fetchAdminCustomers() {
  const response = await adminFetch("/api/admin/customers");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch customers.");
  }

  return {
    customers: data.customers || [],
    stats: data.stats || { totalCustomers: 0, repeatCustomers: 0, totalSpent: 0 },
  };
}

export async function fetchProductPicker(search = "", limit = 30) {
  const params = new URLSearchParams();
  if (search.trim()) params.set("q", search.trim());
  params.set("limit", String(limit));

  const response = await adminFetch(`/api/admin/products/picker?${params.toString()}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch products.");
  }

  return data.products || [];
}
