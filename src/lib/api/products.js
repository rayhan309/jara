export const productKeys = {
  all: ["products"],
  list: () => [...productKeys.all, "list"],
};

export async function fetchProducts() {
  const response = await fetch("/api/products");

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Failed to fetch products.");
  }

  const data = await response.json();
  return data.products || [];
}

export async function createProduct(formData) {
  const response = await fetch("/api/products", {
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
  const response = await fetch(`/api/products/${id}`, {
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
  const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to delete product.");
  }

  return id;
}
