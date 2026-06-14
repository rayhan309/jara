import { adminFetch } from "@/lib/adminFetch";

export const productAttributeKeys = {
  all: ["product-attributes"],
  list: () => [...productAttributeKeys.all, "list"],
};

export async function fetchProductAttributes() {
  const response = await adminFetch("/api/admin/product-attributes");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch attributes.");
  }

  return data.attributes || [];
}

export async function createProductAttribute(payload) {
  const response = await adminFetch("/api/admin/product-attributes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create attribute.");
  }

  return data.attribute;
}

export async function updateProductAttribute(id, payload) {
  const response = await adminFetch(`/api/admin/product-attributes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update attribute.");
  }

  return data.attribute;
}

export async function deleteProductAttribute(id) {
  const response = await adminFetch(`/api/admin/product-attributes/${id}`, { method: "DELETE" });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to delete attribute.");
  }

  return id;
}
