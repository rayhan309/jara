import { filterProductsByCategory } from "@/lib/categoryFilter";

export function countProductsForCategory(products = [], category) {
  if (!category) return 0;
  return filterProductsByCategory(products, category).length;
}

export function buildCategoryProductCounts(products = [], categories = []) {
  const counts = new Map();

  categories.forEach((category) => {
    counts.set(category._id, countProductsForCategory(products, category));
  });

  return counts;
}

export function filterCategoriesBySearch(categories = [], search = "") {
  const term = search.trim().toLowerCase();
  if (!term) return categories;

  return categories.filter(
    (category) =>
      category.name?.toLowerCase().includes(term) ||
      category.slug?.toLowerCase().includes(term) ||
      category.description?.toLowerCase().includes(term)
  );
}
