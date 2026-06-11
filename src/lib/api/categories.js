export const categoryKeys = {
  all: ["categories"],
  list: () => [...categoryKeys.all, "list"],
};

export async function fetchCategories() {
  const response = await fetch("/api/categories");

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Failed to fetch categories.");
  }

  const data = await response.json();
  return data.categories || [];
}

export async function createCategory(formData) {
  const response = await fetch("/api/categories", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create category.");
  }

  return data.category;
}

export async function updateCategory(id, formData) {
  const response = await fetch(`/api/categories/${id}`, {
    method: "PUT",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update category.");
  }

  return data.category;
}

export async function deleteCategory(id) {
  const response = await fetch(`/api/categories/${id}`, { method: "DELETE" });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to delete category.");
  }

  return id;
}

export async function reorderCategories(orderedIds) {
  const response = await fetch("/api/categories/reorder", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderedIds }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to reorder categories.");
  }

  return data.categories || [];
}
