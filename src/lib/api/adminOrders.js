export const adminOrderKeys = {
  all: ["admin-orders"],
  list: () => [...adminOrderKeys.all, "list"],
  detail: (id) => [...adminOrderKeys.all, "detail", id],
};

export async function fetchAdminOrders() {
  const response = await fetch("/api/admin/orders");

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Failed to fetch orders.");
  }

  const data = await response.json();
  return data.orders || [];
}

export async function fetchAdminOrder(id) {
  const response = await fetch(`/api/admin/orders/${id}`);

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Failed to fetch order.");
  }

  const data = await response.json();
  return data.order;
}

export async function updateAdminOrder(id, payload) {
  const response = await fetch(`/api/admin/orders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update order.");
  }

  return data.order;
}

export async function deleteAdminOrder(id) {
  const response = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to delete order.");
  }

  return id;
}
