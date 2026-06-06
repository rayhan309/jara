export const ORDER_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_STYLE = {
  pending: "bg-slate-100 text-slate-600 border-slate-200",
  processing: "bg-amber-50 text-amber-700 border-amber-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

export function getOrderStatusLabel(status) {
  return ORDER_STATUSES.find((entry) => entry.value === status)?.label || status;
}

export function getOrderStatusClass(status) {
  return STATUS_STYLE[status] || STATUS_STYLE.pending;
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
