export function getOrderItemKey(item) {
  return `${item.product_id}::${item.selected_variant || ""}`;
}

export function normalizeAdminOrderItem(item) {
  const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
  const price = Math.max(0, Number(item.price) || 0);
  const discount = Math.max(0, Number(item.discount) || 0);
  const lineSubtotal = price * quantity;
  const lineTotal = Math.max(0, lineSubtotal - discount);

  return {
    product_id: String(item.product_id || ""),
    slug: item.slug || "",
    title: String(item.title || "Product").trim(),
    title_en: item.title_en || "",
    image: item.image || "",
    price,
    regular_price: Number(item.regular_price) || price,
    quantity,
    discount,
    selected_variant: String(item.selected_variant || "").trim(),
    variant_type: item.variant_type || "",
    line_total: lineTotal,
  };
}

export function calculateAdminOrderPricing(items = [], shippingFee = 0, orderDiscount = 0) {
  const normalizedItems = items.map(normalizeAdminOrderItem);
  const subtotal = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemDiscount = normalizedItems.reduce((sum, item) => sum + item.discount, 0);
  const shipping = Math.max(0, Number(shippingFee) || 0);
  const discount = Math.max(0, Number(orderDiscount) || 0);
  const total = Math.max(0, subtotal - itemDiscount - discount + shipping);

  return {
    items: normalizedItems,
    subtotal,
    itemDiscount,
    shipping,
    discount,
    total,
  };
}

export function validateAdminOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Order must have at least one item." };
  }

  for (const item of items) {
    if (!item?.product_id) {
      return { ok: false, error: "Each item must have a product." };
    }

    const quantity = Number(item.quantity);
    const price = Number(item.price);

    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 999) {
      return { ok: false, error: "Invalid item quantity." };
    }

    if (!Number.isFinite(price) || price < 0) {
      return { ok: false, error: "Invalid item price." };
    }

    const discount = Number(item.discount) || 0;
    if (discount < 0 || discount > price * quantity) {
      return { ok: false, error: "Item discount cannot exceed line subtotal." };
    }
  }

  return { ok: true };
}

export function computeStockAdjustments(oldItems = [], newItems = []) {
  const oldMap = new Map();
  const newMap = new Map();

  for (const item of oldItems) {
    const key = getOrderItemKey(item);
    oldMap.set(key, (oldMap.get(key) || 0) + Number(item.quantity || 0));
  }

  for (const item of newItems) {
    const key = getOrderItemKey(item);
    newMap.set(key, (newMap.get(key) || 0) + Number(item.quantity || 0));
  }

  const adjustments = new Map();
  const keys = new Set([...oldMap.keys(), ...newMap.keys()]);

  for (const key of keys) {
    const oldQty = oldMap.get(key) || 0;
    const newQty = newMap.get(key) || 0;
    const diff = newQty - oldQty;

    if (diff !== 0) {
      const productId = key.split("::")[0];
      adjustments.set(productId, (adjustments.get(productId) || 0) - diff);
    }
  }

  return adjustments;
}

export function formatVariantDisplay(item) {
  if (!item?.selected_variant) return "N/A";
  const label = item.variant_type === "weight" ? "Weight" : "Size";
  return `${label}: ${item.selected_variant}`;
}
