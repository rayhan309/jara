export const DEFAULT_ORDER_STATUS = "new";

export const ORDER_STATUSES = [
  { value: "new", label: "New order" },
  { value: "confirmed", label: "Order confirmed" },
  { value: "steadfast_entered", label: "Entered in Steadfast" },
  { value: "no_response", label: "No response" },
  { value: "will_inform_later", label: "Will inform later" },
  { value: "color_code_pending", label: "Color code pending — follow up needed" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "scammer", label: "Scammer / fraudulent" },
];

export const ORDER_STATUS_VALUES = ORDER_STATUSES.map((entry) => entry.value);

/** Legacy statuses kept for older orders in the database. */
const LEGACY_STATUS_ALIASES = {
  pending: "new",
  processing: "confirmed",
  shipped: "steadfast_entered",
  delivered: "out_for_delivery",
  cancelled: "scammer",
};

const LEGACY_STATUS_VALUES = Object.keys(LEGACY_STATUS_ALIASES);

export const ALL_VALID_ORDER_STATUSES = [...ORDER_STATUS_VALUES, ...LEGACY_STATUS_VALUES];

export const EXCLUDED_ORDER_STATUSES = ["scammer", "cancelled"];

export const ORDER_TRACKING_STEPS = [
  "New order",
  "Order confirmed",
  "Entered with courier",
  "Out for delivery",
];

const STATUS_STYLE = {
  new: "bg-slate-100 text-slate-700 border-slate-200",
  confirmed: "bg-sky-50 text-sky-700 border-sky-200",
  steadfast_entered: "bg-indigo-50 text-indigo-700 border-indigo-200",
  no_response: "bg-amber-50 text-amber-700 border-amber-200",
  will_inform_later: "bg-orange-50 text-orange-700 border-orange-200",
  color_code_pending: "bg-violet-50 text-violet-700 border-violet-200",
  out_for_delivery: "bg-emerald-50 text-emerald-700 border-emerald-200",
  scammer: "bg-red-50 text-red-600 border-red-200",
  pending: "bg-slate-100 text-slate-700 border-slate-200",
  processing: "bg-sky-50 text-sky-700 border-sky-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

const TRACKING_INFO = {
  new: { step: 1, label: "New order" },
  confirmed: { step: 2, label: "Order confirmed" },
  steadfast_entered: { step: 3, label: "Entered in Steadfast" },
  no_response: { step: 2, label: "No response" },
  will_inform_later: { step: 2, label: "Will inform later" },
  color_code_pending: { step: 2, label: "Color code pending — follow up needed" },
  out_for_delivery: { step: 4, label: "Out for delivery" },
  scammer: { step: 0, label: "Scammer / fraudulent" },
  pending: { step: 1, label: "New order" },
  processing: { step: 2, label: "Order confirmed" },
  shipped: { step: 3, label: "Entered in Steadfast" },
  delivered: { step: 4, label: "Out for delivery" },
  cancelled: { step: 0, label: "Scammer / fraudulent" },
};

export function normalizeOrderStatus(status) {
  return LEGACY_STATUS_ALIASES[status] || status;
}

export function getOrderStatusLabel(status) {
  const normalized = normalizeOrderStatus(status);
  return ORDER_STATUSES.find((entry) => entry.value === normalized)?.label || status;
}

export function getOrderStatusClass(status) {
  const normalized = normalizeOrderStatus(status);
  return STATUS_STYLE[normalized] || STATUS_STYLE[status] || STATUS_STYLE.new;
}

export function getOrderTrackingInfo(status) {
  const normalized = normalizeOrderStatus(status);
  return TRACKING_INFO[normalized] || TRACKING_INFO.new;
}

export function isExcludedOrderStatus(status) {
  const normalized = normalizeOrderStatus(status);
  return EXCLUDED_ORDER_STATUSES.includes(normalized) || EXCLUDED_ORDER_STATUSES.includes(status);
}

export function isNewOrderStatus(status) {
  const normalized = normalizeOrderStatus(status);
  return normalized === "new";
}

export function isDeliveredOrderStatus(status) {
  const normalized = normalizeOrderStatus(status);
  return normalized === "out_for_delivery";
}

export function formatOrderDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatOrderTotal(order) {
  return `৳${Number(order?.pricing?.total || 0).toLocaleString()}`;
}

export function getOrderItemSummary(order) {
  const items = order?.items || [];
  if (items.length === 0) return "—";
  if (items.length === 1) return items[0].title;
  return `${items[0].title} +${items.length - 1} more`;
}

/** Strip # and NX- prefix from user search input */
export function normalizeOrderNumberQuery(value) {
  return String(value || "")
    .trim()
    .replace(/^#/, "")
    .replace(/^NX-/i, "")
    .trim();
}

/** Display ID — always NX-XXXX (supports legacy numeric and NEXA-* stored values) */
export function formatDisplayOrderNumber(orderNumber) {
  if (!orderNumber) return "—";
  const str = String(orderNumber).trim();
  if (/^NX-\d+$/i.test(str)) return `NX-${str.replace(/^NX-/i, "")}`;
  if (/^\d+$/.test(str)) return `NX-${str}`;
  if (/^NEXA-/i.test(str)) {
    const match = str.match(/(\d+)$/);
    if (match) return `NX-${match[1]}`;
  }
  const trailing = str.match(/(\d+)$/);
  if (trailing) return `NX-${trailing[1]}`;
  return str;
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** MongoDB filter for order lookup — NX-5436, 5436, or legacy NEXA-* */
export function buildOrderNumberLookupFilter(query) {
  const raw = String(query || "").trim().replace(/^#/, "");
  if (!raw) return null;

  const serial = normalizeOrderNumberQuery(raw);
  const conditions = [{ order_number: { $regex: new RegExp(`^${escapeRegex(raw)}$`, "i") } }];

  if (serial) {
    conditions.push({ order_number: { $regex: new RegExp(`^NX-${escapeRegex(serial)}$`, "i") } });
    if (/^\d+$/.test(serial)) {
      conditions.push({ order_number: serial });
      conditions.push({ order_number: { $regex: new RegExp(`NEXA-.*${escapeRegex(serial)}$`, "i") } });
    }
  }

  return { $or: conditions };
}

/** Public Steadfast parcel tracking page */
export function getSteadfastTrackingUrl(trackingCode) {
  const code = String(trackingCode || "").trim();
  if (!code) return null;
  return `https://steadfast.com.bd/t/${encodeURIComponent(code)}`;
}

export function getOrderSteadfastTrackingUrl(order) {
  return getSteadfastTrackingUrl(order?.steadfast?.tracking_code);
}

export function buildCourierClipboardText(order) {
  const items = (order.items || [])
    .map((item) => `${item.title}${item.selected_variant ? ` (${item.selected_variant})` : ""} x${item.quantity}`)
    .join(", ");

  return [
    `Order: ${formatDisplayOrderNumber(order.order_number)}`,
    `Name: ${order.customer?.name || ""}`,
    `Phone: ${order.customer?.phone || ""}`,
    `Address: ${order.customer?.address || ""}`,
    `Area: ${order.delivery?.label || order.customer?.delivery_area || ""}`,
    `Cash collect: ৳${Number(order.pricing?.total || 0).toLocaleString()}`,
    `Items: ${items}`,
  ].join("\n");
}

export function getWhatsAppPhoneUrl(phone) {
  let digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith("880")) {
    // already BD international format
  } else if (digits.startsWith("0")) {
    digits = `880${digits.slice(1)}`;
  } else {
    digits = `880${digits}`;
  }

  return `https://wa.me/${digits}`;
}

export const ORDER_DATE_FILTERS = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "7d", label: "7 Days" },
  { id: "15d", label: "15 Days" },
  { id: "30d", label: "30 Days" },
  { id: "lifetime", label: "Lifetime" },
  { id: "custom", label: "Custom" },
];

function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfDay(date) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

export function getOrderDateRange(filter, customFrom = "", customTo = "") {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  switch (filter) {
    case "today":
      return { start: todayStart, end: todayEnd };
    case "yesterday": {
      const day = new Date(todayStart);
      day.setDate(day.getDate() - 1);
      return { start: startOfDay(day), end: endOfDay(day) };
    }
    case "7d": {
      const start = new Date(todayStart);
      start.setDate(start.getDate() - 6);
      return { start, end: todayEnd };
    }
    case "15d": {
      const start = new Date(todayStart);
      start.setDate(start.getDate() - 14);
      return { start, end: todayEnd };
    }
    case "30d": {
      const start = new Date(todayStart);
      start.setDate(start.getDate() - 29);
      return { start, end: todayEnd };
    }
    case "custom": {
      if (!customFrom && !customTo) return null;
      return {
        start: customFrom ? startOfDay(customFrom) : new Date(0),
        end: customTo ? endOfDay(customTo) : todayEnd,
      };
    }
    case "lifetime":
    default:
      return null;
  }
}

export function isOrderInDateRange(order, range) {
  if (!range) return true;
  const created = new Date(order?.createdAt);
  if (Number.isNaN(created.getTime())) return false;
  return created >= range.start && created <= range.end;
}
