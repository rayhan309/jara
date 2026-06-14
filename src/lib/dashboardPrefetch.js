import { hasPermission, PERMISSIONS } from "@/lib/adminRoles";
import { getAdminOrders } from "@/lib/adminOrdersServer";
import { getDefaultProducts } from "@/lib/productsServer";
import { getDashboardSummary } from "@/lib/dashboardSummaryServer";
import { getAdminCustomers } from "@/lib/customersServer";

export async function getDashboardPrefetch(session) {
  if (!session?.role) {
    return {};
  }

  const prefetch = {};
  const tasks = [];

  if (hasPermission(session.role, PERMISSIONS.OVERVIEW)) {
    tasks.push(
      getDashboardSummary().then((summary) => {
        prefetch.summary = summary;
      })
    );
  }

  if (hasPermission(session.role, PERMISSIONS.CUSTOMERS)) {
    tasks.push(
      getAdminCustomers().then((data) => {
        prefetch.customers = data;
      })
    );
  }

  if (hasPermission(session.role, PERMISSIONS.ORDERS)) {
    tasks.push(
      getAdminOrders().then((orders) => {
        prefetch.orders = orders;
      })
    );
  }

  if (hasPermission(session.role, PERMISSIONS.PRODUCTS)) {
    tasks.push(
      getDefaultProducts().then((products) => {
        prefetch.products = products;
      })
    );
  }

  await Promise.all(tasks);
  return prefetch;
}
