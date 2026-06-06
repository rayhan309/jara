const STORAGE_KEY = "nexa_selected_category_id";

export function getSelectedCategoryId() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setSelectedCategoryId(id) {
  if (typeof window === "undefined") return;
  if (!id) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, id);
}

export function clearSelectedCategoryId() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function findCategoryBySlug(categories, slug) {
  if (!slug) return null;
  return categories.find((item) => item.slug === slug) || null;
}

export function findCategoryById(categories, id) {
  if (!id) return null;
  return categories.find((item) => item._id === id) || null;
}

export function filterProductsByCategory(products, category) {
  if (!category) return products;

  return products.filter((product) => {
    if (product.category_id && product.category_id === category._id) return true;
    if (product.category_slug && product.category_slug === category.slug) return true;
    return (
      String(product.category || "").toLowerCase() ===
      String(category.name || "").toLowerCase()
    );
  });
}
