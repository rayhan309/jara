export async function createOrder(payload) {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Could not place order");
  }

  return data.order;
}

export async function fetchOrderByNumber(orderNumber) {
  const normalized = String(orderNumber || "")
    .trim()
    .replace(/^#/, "");

  if (!normalized) {
    throw new Error("Please enter an order number");
  }

  const response = await fetch(
    `/api/orders?order=${encodeURIComponent(normalized)}`
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Order not found");
  }

  return data.order;
}

export async function fetchOrdersByPhone(phone) {
  const normalized = String(phone || "").replace(/\D/g, "").slice(0, 11);

  if (!normalized) {
    throw new Error("Please enter a phone number");
  }

  const response = await fetch(
    `/api/orders?phone=${encodeURIComponent(normalized)}`
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "No orders found");
  }

  return data.orders || [];
}
