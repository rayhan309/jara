import { parseVariantOptions, getVariantTypeLabel } from "./productVariants";
import { resolveProductPricing } from "./productPricing";
import {
  getProductMaxStock as resolveProductMaxStock,
  UNTRACKED_STOCK_LIMIT,
} from "./variantStock";

export { UNTRACKED_STOCK_LIMIT };

const CART_KEY = "nexa_cart";
const CHECKOUT_KEY = "nexa_checkout_items";
const CART_EVENT = "nexa-cart-updated";

function dispatchCartUpdate() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CART_EVENT));
}

function readCart() {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(items) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  dispatchCartUpdate();
}

function findCartLineIndex(cart, productId, selectedVariant = "") {
  return cart.findIndex(
    (entry) =>
      entry._id === productId && (entry.selected_variant || "") === (selectedVariant || "")
  );
}

export function getProductMaxStock(product, selectedVariant = "") {
  return resolveProductMaxStock(product, selectedVariant);
}

export function getCartItems() {
  return readCart();
}

export function getCartCount() {
  return readCart().reduce((total, item) => total + (item.quantity || 1), 0);
}

export function normalizeCartProduct(product, selectedVariant = "") {
  const maxStock = getProductMaxStock(product, selectedVariant);
  const attrs = product.attributes || {};
  const variantType = attrs.variant_type || "";
  let variantOptions = parseVariantOptions(attrs.variant_options);
  if (!variantOptions.length && attrs.size) {
    variantOptions = parseVariantOptions(attrs.size);
  }

  const entry = product.inventory?.variant_stock?.find((item) => item.option === selectedVariant);
  const stockStatus =
    entry?.stock_status ??
    product.inventory?.stock_status ??
    product.stock_status ??
    "in_stock";

  const pricing = resolveProductPricing(product, selectedVariant);

  return {
    _id: product._id,
    slug: product.slug,
    title: product.title_bn || product.title_en || product.title,
    title_en: product.title_en,
    image: product.images?.[0]?.url || product.image || "",
    price: pricing.sale_price ?? product.price ?? 0,
    regular_price: pricing.regular_price ?? product.regular_price ?? 0,
    quantity: 1,
    max_stock: maxStock,
    stock_status: stockStatus,
    selected_variant: selectedVariant || "",
    variant_type: variantType,
    variant_label: getVariantTypeLabel(attrs, "bn"),
    variant_options: variantOptions,
  };
}

function capQuantity(quantity, maxStock) {
  if (maxStock <= 0) return 0;
  return Math.min(Math.max(quantity, 0), maxStock);
}

export function addToCart(product, quantity = 1, selectedVariant = "") {
  const cart = readCart();
  const item = normalizeCartProduct(product, selectedVariant);
  const maxStock = item.max_stock;

  if (maxStock <= 0) {
    return { ok: false, reason: "out_of_stock", maxStock };
  }

  const existingIndex = findCartLineIndex(cart, item._id, selectedVariant);
  const currentQty = existingIndex >= 0 ? cart[existingIndex].quantity : 0;
  const nextQty = currentQty + quantity;
  const cappedQty = capQuantity(nextQty, maxStock);

  if (cappedQty <= currentQty) {
    return {
      ok: false,
      reason: "max_stock",
      maxStock,
      currentQty,
    };
  }

  if (existingIndex >= 0) {
    cart[existingIndex].quantity = cappedQty;
    cart[existingIndex].max_stock = maxStock;
  } else {
    cart.unshift({ ...item, quantity: cappedQty });
  }

  writeCart(cart);

  return {
    ok: true,
    cart,
    addedQty: cappedQty - currentQty,
    quantity: cappedQty,
    maxStock,
    limited: cappedQty < nextQty,
  };
}

export function isProductInCart(productId, selectedVariant) {
  if (selectedVariant !== undefined) {
    return findCartLineIndex(readCart(), productId, selectedVariant) >= 0;
  }
  return readCart().some((entry) => entry._id === productId);
}

export function removeFromCart(productId, selectedVariant = "") {
  const cart = readCart().filter(
    (entry) =>
      !(entry._id === productId && (entry.selected_variant || "") === (selectedVariant || ""))
  );
  writeCart(cart);
  return cart;
}

export function updateCartQuantity(productId, quantity, selectedVariant = "") {
  const cart = readCart();
  const index = findCartLineIndex(cart, productId, selectedVariant);

  if (index < 0) {
    return { ok: false, reason: "not_found" };
  }

  const maxStock = cart[index].max_stock ?? UNTRACKED_STOCK_LIMIT;

  if (quantity <= 0) {
    cart.splice(index, 1);
    writeCart(cart);
    return { ok: true, cart, removed: true };
  }

  const cappedQty = capQuantity(quantity, maxStock);

  if (cappedQty < quantity) {
    return {
      ok: false,
      reason: "max_stock",
      maxStock,
      currentQty: cart[index].quantity,
    };
  }

  cart[index].quantity = cappedQty;
  writeCart(cart);

  return { ok: true, cart, quantity: cappedQty, maxStock };
}

export function updateCartVariant(productId, oldVariant, newVariant) {
  if ((oldVariant || "") === (newVariant || "")) {
    return { ok: true, cart: readCart() };
  }

  const cart = readCart();
  const index = findCartLineIndex(cart, productId, oldVariant);

  if (index < 0) {
    return { ok: false, reason: "not_found" };
  }

  const line = { ...cart[index] };
  const mergeIndex = findCartLineIndex(cart, productId, newVariant);

  if (mergeIndex >= 0 && mergeIndex !== index) {
    const maxStock = line.max_stock ?? UNTRACKED_STOCK_LIMIT;
    const mergedQty = cart[mergeIndex].quantity + line.quantity;
    const cappedQty = capQuantity(mergedQty, maxStock);

    if (cappedQty <= cart[mergeIndex].quantity) {
      return { ok: false, reason: "max_stock", maxStock };
    }

    cart[mergeIndex].quantity = cappedQty;
    cart.splice(index, 1);
  } else {
    cart[index] = { ...line, selected_variant: newVariant || "" };
  }

  writeCart(cart);
  return { ok: true, cart };
}

export function toggleCartItem(product, selectedVariant = "") {
  const cart = readCart();
  const existingIndex = findCartLineIndex(cart, product._id, selectedVariant);

  if (existingIndex >= 0) {
    cart.splice(existingIndex, 1);
    writeCart(cart);
    return { cart, added: false };
  }

  const item = normalizeCartProduct(product, selectedVariant);

  if (item.max_stock <= 0) {
    return { cart, added: false, ok: false, reason: "out_of_stock" };
  }

  cart.unshift({ ...item, quantity: 1 });
  writeCart(cart);
  return { cart, added: true, ok: true };
}

export function clearCart() {
  writeCart([]);
  return [];
}

export function setCheckoutItems(items) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CHECKOUT_KEY, JSON.stringify(items));
}

export function getCheckoutItems() {
  if (typeof window === "undefined") return [];

  try {
    const raw = sessionStorage.getItem(CHECKOUT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function buyNow(product, quantity = 1, selectedVariant = "") {
  const result = addToCart(product, quantity, selectedVariant);

  if (!result.ok) {
    return { ...result, item: null };
  }

  const item = getCartItems().find(
    (entry) =>
      entry._id === product._id && (entry.selected_variant || "") === (selectedVariant || "")
  );
  if (item) setCheckoutItems([item]);

  return { ...result, item };
}

export function getMaxLineQuantity(item, cartItems) {
  const maxStock = item.max_stock ?? UNTRACKED_STOCK_LIMIT;
  const totalForProduct = cartItems
    .filter((entry) => entry._id === item._id)
    .reduce((sum, entry) => sum + entry.quantity, 0);

  return maxStock - totalForProduct + item.quantity;
}

export { CART_EVENT };
