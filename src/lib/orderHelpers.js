export const DEFAULT_ORDER_STATUS = "new";

export const ORDER_STATUSES = [
  { value: "new", label: "নতুন অর্ডার" },
  { value: "confirmed", label: "অর্ডার কনফার্ম" },
  { value: "steadfast_entered", label: "স্টিডফাস্টে এন্ট্রি করা হয়েছে" },
  { value: "no_response", label: "নো রেসপন্স" },
  { value: "will_inform_later", label: "পরে জানাবে" },
  { value: "color_code_pending", label: "কালার কোড দেয় নাই কথা বলতে হবে" },
  { value: "out_for_delivery", label: "ডেলিভারির জন্য বের হয়েছে" },
  { value: "scammer", label: "চিটার বাটপার" },
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
  "নতুন অর্ডার",
  "অর্ডার কনফার্ম",
  "কুরিয়ারে এন্ট্রি",
  "ডেলিভারির জন্য বের হয়েছে",
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
  new: { step: 1, label: "নতুন অর্ডার" },
  confirmed: { step: 2, label: "অর্ডার কনফার্ম" },
  steadfast_entered: { step: 3, label: "স্টিডফাস্টে এন্ট্রি করা হয়েছে" },
  no_response: { step: 2, label: "নো রেসপন্স" },
  will_inform_later: { step: 2, label: "পরে জানাবে" },
  color_code_pending: { step: 2, label: "কালার কোড দেয় নাই কথা বলতে হবে" },
  out_for_delivery: { step: 4, label: "ডেলিভারির জন্য বের হয়েছে" },
  scammer: { step: 0, label: "চিটার বাটপার" },
  pending: { step: 1, label: "নতুন অর্ডার" },
  processing: { step: 2, label: "অর্ডার কনফার্ম" },
  shipped: { step: 3, label: "স্টিডফাস্টে এন্ট্রি করা হয়েছে" },
  delivered: { step: 4, label: "ডেলিভারির জন্য বের হয়েছে" },
  cancelled: { step: 0, label: "চিটার বাটপার" },
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
