export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "";

export function isMetaPixelEnabled() {
  return Boolean(META_PIXEL_ID);
}

function canTrack() {
  return isMetaPixelEnabled() && typeof window !== "undefined" && typeof window.fbq === "function";
}

export function trackMetaPageView() {
  if (!canTrack()) return;
  window.fbq("track", "PageView");
}

export function trackMetaEvent(event, params = {}) {
  if (!canTrack()) return;
  window.fbq("track", event, params);
}

export function buildProductPixelPayload(product, quantity = 1) {
  const price = Number(product?.pricing?.sale_price || product?.price || 0);
  const id = String(product?._id || "");

  return {
    content_ids: [id],
    content_name: product?.title_bn || product?.title_en || product?.title || "",
    content_type: "product",
    value: price * quantity,
    currency: "BDT",
    contents: [{ id, quantity, item_price: price }],
  };
}

export function buildCartPixelPayload(cartItems, value) {
  const contents = (cartItems || []).map((item) => ({
    id: String(item._id),
    quantity: item.quantity,
    item_price: item.price,
  }));

  return {
    content_ids: contents.map((item) => item.id),
    content_type: "product",
    contents,
    value: Number(value || 0),
    currency: "BDT",
    num_items: contents.reduce((sum, item) => sum + item.quantity, 0),
  };
}
