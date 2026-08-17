const WISHLIST_KEY = "raisas_wishlist";
export const WISHLIST_EVENT = "raisas-wishlist-updated";

function dispatchWishlistUpdate() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(WISHLIST_EVENT));
}

function readWishlist() {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeWishlist(items) {
  if (typeof window === "undefined") return;
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  dispatchWishlistUpdate();
}

function findWishlistIndex(items, productId, selectedVariant = "") {
  return items.findIndex(
    (entry) =>
      entry._id === productId && (entry.selected_variant || "") === (selectedVariant || "")
  );
}

export function normalizeWishlistProduct(product, selectedVariant = "") {
  const pricing = product.pricing || {};
  return {
    _id: product._id,
    slug: product.slug,
    title: product.title_bn || product.title_en || product.title || "পণ্য",
    title_en: product.title_en,
    image: product.images?.[0]?.url || product.image || "",
    price: pricing.sale_price ?? product.price ?? 0,
    regular_price: pricing.regular_price ?? product.regular_price ?? 0,
    selected_variant: selectedVariant || "",
  };
}

export function getWishlistItems() {
  return readWishlist();
}

export function getWishlistCount() {
  return readWishlist().length;
}

export function isProductInWishlist(productId, selectedVariant = "") {
  return findWishlistIndex(readWishlist(), productId, selectedVariant) >= 0;
}

export function addToWishlist(product, selectedVariant = "") {
  const items = readWishlist();
  const index = findWishlistIndex(items, product._id, selectedVariant);

  if (index >= 0) {
    return { ok: true, items, added: false };
  }

  const entry = normalizeWishlistProduct(product, selectedVariant);
  items.unshift(entry);
  writeWishlist(items);
  return { ok: true, items, added: true };
}

export function removeFromWishlist(productId, selectedVariant = "") {
  const items = readWishlist().filter(
    (entry) =>
      !(entry._id === productId && (entry.selected_variant || "") === (selectedVariant || ""))
  );
  writeWishlist(items);
  return items;
}

export function toggleWishlistItem(product, selectedVariant = "") {
  const items = readWishlist();
  const index = findWishlistIndex(items, product._id, selectedVariant);

  if (index >= 0) {
    items.splice(index, 1);
    writeWishlist(items);
    return { items, added: false };
  }

  items.unshift(normalizeWishlistProduct(product, selectedVariant));
  writeWishlist(items);
  return { items, added: true };
}

export function clearWishlist() {
  writeWishlist([]);
  return [];
}
