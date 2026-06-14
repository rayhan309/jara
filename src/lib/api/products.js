import { adminFetch } from "@/lib/adminFetch";

export const productKeys = {
  all: ["products"],
  list: (filters = {}) => [...productKeys.all, "list", filters],
  detail: (id) => [...productKeys.all, "detail", id],
};

export async function fetchProduct(id) {
  const response = await adminFetch(`/api/products/${encodeURIComponent(id)}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch product.");
  }

  return data.product;
}

export async function fetchProducts(filters = {}) {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.category && filters.category !== "all") {
    params.set("category", filters.category);
  }

  const query = params.toString();
  const response = await fetch(`/api/products${query ? `?${query}` : ""}`);

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Failed to fetch products.");
  }

  const data = await response.json();
  return data.products || [];
}

export async function createProduct(formData) {
  const response = await adminFetch("/api/products", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create product.");
  }

  return data.product;
}

export async function updateProduct(id, formData) {
  const response = await adminFetch(`/api/products/${id}`, {
    method: "PUT",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update product.");
  }

  return data.product;
}

export async function deleteProduct(id) {
  const response = await adminFetch(`/api/products/${id}`, { method: "DELETE" });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to delete product.");
  }

  return id;
}
