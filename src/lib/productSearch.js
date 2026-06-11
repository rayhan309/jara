export function normalizeProductSearchTerm(term) {
  return String(term || "").trim().toLowerCase();
}

export function matchesProductSearch(product, term) {
  const query = normalizeProductSearchTerm(term);
  if (!query) return true;

  const haystack = [
    product.title_en,
    product.title_bn,
    product.category,
    product.brand_or_vendor,
    product.slug,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function filterProductsBySearch(products = [], term) {
  const query = normalizeProductSearchTerm(term);
  if (!query) return products;
  return products.filter((product) => matchesProductSearch(product, query));
}
