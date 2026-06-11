export async function (payload) {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "অর্ডার প্লেস করা যায়নি");
  }

  return data.order;
}

export async function fetchOrderByNumber(orderNumber) {
  const normalized = String(orderNumber || "")
    .trim()
    .replace(/^#/, "");

  if (!normalized) {
    throw new Error("অর্ডার নম্বর দিন");
  }

  const response = await fetch(
    `/api/orders?order=${encodeURIComponent(normalized)}`
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "অর্ডার খুঁজে পাওয়া যায়নি");
  }

  return data.order;
}

export async function fetchOrdersByPhone(phone) {
  const normalized = String(phone || "").replace(/\D/g, "").slice(0, 11);

  if (!normalized) {
    throw new Error("ফোন নাম্বার লিখুন");
  }

  const response = await fetch(
    `/api/orders?phone=${encodeURIComponent(normalized)}`
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "কোনো অর্ডার পাওয়া যায়নি");
  }

  return data.orders || [];
}
