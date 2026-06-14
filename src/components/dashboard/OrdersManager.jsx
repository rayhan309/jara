"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import toast from "react-hot-toast";
import {
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Loader2,
  Pencil,
  Phone,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import OrderEditModal from "@/components/dashboard/OrderEditModal";
import {
  useAdminOrders,
  useDeleteAdminOrder,
  useSendBulkOrdersToSteadfast,
  useSendOrderToSteadfast,
} from "@/hooks/useAdminOrders";
import { usePagination } from "@/hooks/usePagination";
import TablePagination from "@/components/dashboard/TablePagination";
import {
  DesktopTable,
  MobileCardList,
  MobileDashCard,
  MobileDashRow,
  mobileDashModalClass,
} from "@/components/shared/ResponsiveTable";
import {
  formatDisplayOrderNumber,
  formatOrderDate,
  formatOrderTotal,
  getOrderDateRange,
  getOrderItemSummary,
  getOrderStatusClass,
  getOrderStatusLabel,
  getSteadfastTrackingUrl,
  getWhatsAppPhoneUrl,
  isOrderInDateRange,
  normalizeOrderStatus,
  ORDER_DATE_FILTERS,
  ORDER_STATUSES,
} from "@/lib/orderHelpers";
import { normalizePhone } from "@/lib/orderValidation";

const inputClass =
  "w-full rounded-md border border-dash-border bg-white px-3 py-2.5 text-sm text-dash-text outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

const PRINT_STYLES = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: "Inter", Arial, sans-serif; color: #0f172a; }
  h1, h2, h3, h4 { margin: 0; }
  .muted { color: #64748b; }
  .title { font-weight: 700; font-size: 18px; }
  .subtitle { font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #6366f1; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { padding: 6px 4px; border-bottom: 1px solid #e2e8f0; text-align: left; }
  th { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; }
  .totals { margin-top: 10px; font-size: 12px; }
  .totals div { display: flex; justify-content: space-between; padding: 2px 0; }
  .badge { display: inline-block; border: 1px solid #cbd5f5; background: #eef2ff; color: #4338ca; padding: 2px 6px; border-radius: 6px; font-size: 11px; font-weight: 600; }
  .divider { height: 1px; background: #e2e8f0; margin: 10px 0; }
  .grid { display: grid; gap: 8px; }
`;

function formatCurrency(value) {
  return `৳${Number(value || 0).toLocaleString()}`;
}

function getCourierId(order) {
  return getSteadfastConsignmentId(order) || getSteadfastTrackingCode(order) || "";
}

function openPrintWindow({ html, title, pageSize }) {
  const win = window.open("", "_blank", "width=920,height=720");
  if (!win) {
    toast.error("Popup blocked. Allow popups to print.");
    return;
  }

  win.document.open();
  win.document.write(`<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          @page { size: ${pageSize}; margin: 8mm; }
          ${PRINT_STYLES}
        </style>
      </head>
      <body>${html}</body>
    </html>`);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 300);
}

function buildInvoiceHtml(order) {
  const orderNumber = formatDisplayOrderNumber(order.order_number);
  const courierId = getCourierId(order);
  const items = order.items || [];

  const rows = items
    .map(
      (item) => `
        <tr>
          <td>${item.title || "-"}</td>
          <td>${item.selected_variant || "-"}</td>
          <td>${item.quantity || 0}</td>
          <td>${formatCurrency(item.price)}</td>
          <td>${formatCurrency(item.line_total)}</td>
        </tr>
      `
    )
    .join("");

  return `
    <div style="width: 148mm; min-height: 210mm;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <p class="subtitle">Invoice</p>
          <h1 class="title">Nexa E-Commerce</h1>
          <p class="muted" style="margin-top:4px;">Order #${orderNumber}</p>
        </div>
        <div style="text-align:right;">
          <p class="muted" style="font-size:11px;">${formatOrderDate(order.createdAt)}</p>
          ${courierId ? `<span class="badge">Courier ID: ${courierId}</span>` : ""}
        </div>
      </div>

      <div class="divider"></div>

      <div class="grid" style="grid-template-columns:1fr 1fr;">
        <div>
          <p class="muted" style="font-size:11px; margin-bottom:4px;">Customer</p>
          <p style="font-weight:600; margin:0;">${order.customer?.name || "-"}</p>
          <p class="muted" style="margin:2px 0;">${order.customer?.phone || "-"}</p>
        </div>
        <div>
          <p class="muted" style="font-size:11px; margin-bottom:4px;">Delivery</p>
          <p style="margin:0;">${order.delivery?.label || "-"}</p>
          <p class="muted" style="margin:2px 0;">${order.delivery?.area || order.customer?.delivery_area || "-"}</p>
        </div>
      </div>

      <div style="margin-top:8px;">
        <p class="muted" style="font-size:11px; margin-bottom:4px;">Address</p>
        <p style="margin:0;">${order.customer?.address || "-"}</p>
      </div>

      <div class="divider"></div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Variant</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div class="totals">
        <div><span>Subtotal</span><span>${formatCurrency(order.pricing?.subtotal)}</span></div>
        <div><span>Delivery</span><span>${formatCurrency(order.pricing?.delivery_charge)}</span></div>
        ${order.pricing?.discount ? `<div><span>Discount</span><span>- ${formatCurrency(order.pricing.discount)}</span></div>` : ""}
        <div style="font-weight:700;"><span>Total</span><span>${formatOrderTotal(order)}</span></div>
      </div>
    </div>
  `;
}

function buildStickerHtml(order) {
  const orderNumber = formatDisplayOrderNumber(order.order_number);
  const courierId = getCourierId(order);

  return `
    <div style="width: 3in; min-height: 2in; border: 1px dashed #cbd5f5; padding: 6px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <p class="subtitle" style="font-size:9px;">Sticker</p>
          <h2 style="font-size:14px; font-weight:700; margin:2px 0;">Order #${orderNumber}</h2>
        </div>
        ${courierId ? `<span class="badge">Courier ID: ${courierId}</span>` : ""}
      </div>
      <div class="divider"></div>
      <p style="margin:0; font-weight:600;">${order.customer?.name || "-"}</p>
      <p class="muted" style="margin:2px 0; font-size:11px;">${order.customer?.phone || "-"}</p>
      <p style="margin:4px 0; font-size:11px;">${order.customer?.address || "-"}</p>
      <p class="muted" style="font-size:10px; margin-top:4px;">${order.delivery?.label || "Delivery"}</p>
    </div>
  `;
}

function SectionTitle({ children }) {
  return (
    <h3 className="border-b border-dash-border pb-2 text-xs font-bold tracking-[0.14em] text-dash-muted uppercase">
      {children}
    </h3>
  );
}

function CopyableValue({ label, value }) {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} কপি হয়েছে`);
    } catch {
      toast.error("কপি করা যায়নি");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`${label} কপি করুন`}
      className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-left text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
    >
      <span>
        {label}: {value}
      </span>
      <Copy className="h-3.5 w-3.5 shrink-0" />
    </button>
  );
}

function SteadfastTrackingActions({ trackingCode }) {
  const code = String(trackingCode || "").trim();
  const trackingUrl = getSteadfastTrackingUrl(code);
  const iconBtn =
    "inline-flex h-7 w-7 items-center justify-center rounded-md border transition-colors";

  if (!code || !trackingUrl) return null;

  async function copyTrackingCode() {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Tracking code কপি হয়েছে");
    } catch {
      toast.error("কপি করা যায়নি");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <a
        href={trackingUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Steadfast tracking খুলুন"
        className="inline-flex items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
      >
        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
        Tracking খুলুন
      </a>
      <button
        type="button"
        onClick={copyTrackingCode}
        title="Tracking code কপি"
        aria-label="Tracking code কপি করুন"
        className={`${iconBtn} border-slate-200 bg-white text-dash-muted hover:border-indigo-200 hover:text-indigo-700`}
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
      <span className="text-xs font-medium text-dash-muted">{code}</span>
    </div>
  );
}

function CustomerPhoneActions({ phone }) {
  if (!phone) {
    return <span className="text-xs text-dash-muted">—</span>;
  }

  const iconBtn =
    "inline-flex h-7 w-7 items-center justify-center rounded-md border transition-colors";

  async function copyPhone() {
    try {
      await navigator.clipboard.writeText(phone);
      toast.success("নম্বর কপি হয়েছে");
    } catch {
      toast.error("কপি করা যায়নি");
    }
  }

  const whatsappUrl = getWhatsAppPhoneUrl(phone);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs font-medium text-dash-muted">{phone}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={copyPhone}
          title="কপি"
          aria-label="ফোন নম্বর কপি করুন"
          className={`${iconBtn} border-slate-200 bg-white text-dash-muted hover:border-indigo-200 hover:text-indigo-700`}
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <a
          href={`tel:${phone}`}
          title="কল"
          aria-label="কল করুন"
          className={`${iconBtn} border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}
        >
          <Phone className="h-3.5 w-3.5" />
        </a>
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="WhatsApp"
            aria-label="WhatsApp"
            className={`${iconBtn} border-green-200 bg-green-50 text-green-700 hover:bg-green-100`}
          >
            <FaWhatsapp className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-semibold ${getOrderStatusClass(status)}`}
    >
      {getOrderStatusLabel(status)}
    </span>
  );
}

function ModalShell({ open, title, onClose, children, wide = false }) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            className={`${mobileDashModalClass} ${wide ? "sm:max-w-3xl" : "sm:max-w-xl"}`}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-dash-border px-5 py-4">
              <h2 className="text-lg font-bold text-dash-text">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md flex h-8 w-8 items-center justify-center text-dash-muted transition-colors hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function OrderViewModal({ open, onClose, order }) {
  if (!order) return null;

  return (
    <ModalShell
      open={open}
      title={`Order ${formatDisplayOrderNumber(order.order_number)}`}
      onClose={onClose}
      wide
    >
      <div className="space-y-6 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-dash-muted">Order ID</p>
            <p className="mt-1 text-lg font-bold text-indigo-600">
              {formatDisplayOrderNumber(order.order_number)}
            </p>
            <p className="mt-1 text-xs text-dash-muted">{formatOrderDate(order.createdAt)}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-dash-border p-4">
            <SectionTitle>Customer</SectionTitle>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-xs text-dash-muted">Name</dt>
                <dd className="font-semibold text-dash-text">{order.customer?.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-dash-muted">Phone</dt>
                <dd className="mt-1">
                  <CustomerPhoneActions phone={order.customer?.phone} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-dash-muted">Address</dt>
                <dd className="text-dash-text">{order.customer?.address}</dd>
              </div>
              {order.customer?.delivery_area ? (
                <div>
                  <dt className="text-xs text-dash-muted">Delivery Area</dt>
                  <dd className="text-dash-text">{order.customer.delivery_area}</dd>
                </div>
              ) : null}
            </dl>
          </div>
          <div className="rounded-md border border-dash-border p-4">
            <SectionTitle>Delivery & Payment</SectionTitle>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-xs text-dash-muted">Delivery</dt>
                <dd className="font-semibold text-dash-text">
                  {order.delivery?.label} — ৳{order.delivery?.charge?.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-dash-muted">Payment</dt>
                <dd className="font-semibold text-dash-text">{order.payment?.label || "Cash On Delivery"}</dd>
              </div>
              {order.steadfast?.tracking_code || order.steadfast?.consignment_id ? (
                <div>
                  <dt className="text-xs text-dash-muted">Steadfast</dt>
                  <dd className="space-y-2 font-semibold text-dash-text">
                    {order.steadfast.tracking_code ? (
                      <SteadfastTrackingActions trackingCode={String(order.steadfast.tracking_code)} />
                    ) : null}
                    {order.steadfast.consignment_id ? (
                      <CopyableValue
                        label="Consignment ID"
                        value={String(order.steadfast.consignment_id)}
                      />
                    ) : null}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>

        <div>
          <SectionTitle>Items</SectionTitle>
          <div className="mt-3 space-y-3">
            {(order.items || []).map((item, index) => (
              <div
                key={`${item.product_id}-${item.selected_variant}-${index}`}
                className="flex gap-3 rounded-md border border-dash-border p-3"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-slate-100">
                  {item.image ? (
                    <Image src={item.image} alt={item.title} fill unoptimized className="object-contain p-1" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-dash-muted">
                      <ShoppingBag className="h-5 w-5 opacity-40" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-dash-text">{item.title}</p>
                  {item.selected_variant ? (
                    <p className="text-xs text-dash-muted">Variant: {item.selected_variant}</p>
                  ) : null}
                  <p className="mt-1 text-sm text-dash-muted">
                    ৳{item.price?.toLocaleString()} × {item.quantity}
                    {item.discount > 0 ? ` − ৳${item.discount.toLocaleString()} disc.` : ""} ={" "}
                    <span className="font-semibold text-dash-text">৳{item.line_total?.toLocaleString()}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-dash-border bg-slate-50 p-4 text-sm">
          <div className="flex justify-between text-dash-muted">
            <span>Subtotal</span>
            <span className="font-semibold text-dash-text">৳{order.pricing?.subtotal?.toLocaleString()}</span>
          </div>
          {order.pricing?.discount > 0 ? (
            <div className="mt-2 flex justify-between text-emerald-600">
              <span>Discount</span>
              <span className="font-semibold">-৳{order.pricing.discount.toLocaleString()}</span>
            </div>
          ) : null}
          <div className="mt-2 flex justify-between text-dash-muted">
            <span>Delivery</span>
            <span className="font-semibold text-dash-text">৳{order.pricing?.delivery_charge?.toLocaleString()}</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-dash-border pt-3">
            <span className="font-bold text-dash-text">Total</span>
            <span className="text-lg font-bold text-indigo-600">{formatOrderTotal(order)}</span>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

function getSteadfastConsignmentId(order) {
  const id = order?.steadfast?.consignment_id;
  return id != null && id !== "" ? String(id) : null;
}

function getSteadfastTrackingCode(order) {
  const code = order?.steadfast?.tracking_code;
  return code != null && code !== "" ? String(code) : null;
}

function OrderRowActions({
  order,
  onView,
  onEdit,
  onDelete,
  onCourier,
  isDeleting,
  isSendingCourier,
}) {
  const iconBtn =
    "inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors";
  const consignmentId = getSteadfastConsignmentId(order);
  const trackingCode = getSteadfastTrackingCode(order);
  const trackingUrl = getSteadfastTrackingUrl(trackingCode);
  const alreadySent = Boolean(consignmentId || trackingCode);

  async function copyConsignmentId() {
    if (!consignmentId) return;

    try {
      await navigator.clipboard.writeText(consignmentId);
      toast.success("Consignment ID কপি হয়েছে");
    } catch {
      toast.error("কপি করা যায়নি");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        title="Print Invoice"
        aria-label="Print Invoice"
        onClick={() =>
          openPrintWindow({
            title: `Invoice ${order.order_number}`,
            pageSize: "A5",
            html: buildInvoiceHtml(order),
          })
        }
        className={`${iconBtn} border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100`}
      >
        <FileText className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Print Sticker"
        aria-label="Print Sticker"
        onClick={() =>
          openPrintWindow({
            title: `Sticker ${order.order_number}`,
            pageSize: "2in 3in",
            html: buildStickerHtml(order),
          })
        }
        className={`${iconBtn} border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}
      >
        <Tag className="h-4 w-4" />
      </button>
      {alreadySent ? (
        <>
          {consignmentId ? (
            <button
              type="button"
              onClick={copyConsignmentId}
              title="Consignment ID কপি করুন"
              aria-label="Consignment ID কপি করুন"
              className="inline-flex h-8 max-w-[140px] items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 text-[11px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 sm:max-w-[160px]"
            >
              <Copy className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{consignmentId}</span>
            </button>
          ) : null}
        </>
      ) : (
        <button
          type="button"
          onClick={() => onCourier(order)}
          disabled={isSendingCourier}
          title="Steadfast-এ পাঠান"
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-violet-200 bg-violet-50 px-2.5 text-[11px] font-semibold text-violet-700 transition-colors hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSendingCourier ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Truck className="h-3.5 w-3.5" />
          )}
          <span className="hidden xl:inline">কুরিয়ারে পাঠান</span>
        </button>
      )}
      <button
        type="button"
        aria-label="View order"
        title="View"
        onClick={() => onView(order)}
        className={`${iconBtn} border-slate-200 bg-white text-dash-text hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700`}
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Edit order"
        title="Edit"
        onClick={() => onEdit(order)}
        className={`${iconBtn} border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100`}
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Delete order"
        title="Delete"
        onClick={() => onDelete(order)}
        disabled={isDeleting}
        className={`${iconBtn} border-red-200 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-60`}
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

function RepeatCustomerBadge({ phone, count }) {
  if (!phone || count < 2) return null;

  return (
    <Link
      href={`/dashboard/reports/repeat-customers?phone=${encodeURIComponent(phone)}`}
      className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600 hover:bg-red-100"
      title="Repeat customer report"
    >
      Repeat customer
    </Link>
  );
}

export default function OrdersManager({ initialSearch = "" }) {
  const { data: orders = [], isLoading, isError, error, refetch } = useAdminOrders();
  const { mutate: deleteOrder, isPending: isDeleting, variables: deletingId } = useDeleteAdminOrder();
  const { mutateAsync: sendToSteadfast } = useSendOrderToSteadfast();
  const { mutateAsync: sendBulkToSteadfast } = useSendBulkOrdersToSteadfast();

  const [viewOrder, setViewOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("lifetime");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [search, setSearch] = useState(initialSearch);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [courierOrderId, setCourierOrderId] = useState(null);
  const [bulkCourierLoading, setBulkCourierLoading] = useState(false);

  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearch(initialSearch);
    }
  }, [initialSearch]);

  const repeatCustomerMap = useMemo(() => {
    const map = new Map();
    orders.forEach((order) => {
      const phone = normalizePhone(order.customer?.phone || "");
      if (!phone) return;
      map.set(phone, (map.get(phone) || 0) + 1);
    });
    return map;
  }, [orders]);

  function getRepeatCount(phone) {
    const normalized = normalizePhone(phone || "");
    return normalized ? repeatCustomerMap.get(normalized) || 0 : 0;
  }

  const dateRange = useMemo(
    () => getOrderDateRange(dateFilter, customDateFrom, customDateTo),
    [dateFilter, customDateFrom, customDateTo]
  );

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();

    return orders.filter((order) => {
      if (statusFilter !== "all" && normalizeOrderStatus(order.status) !== statusFilter) {
        return false;
      }
      if (!isOrderInDateRange(order, dateRange)) return false;
      if (!term) return true;

      const displayId = formatDisplayOrderNumber(order.order_number);

      return (
        order.order_number?.toLowerCase().includes(term) ||
        displayId.includes(term) ||
        order.customer?.name?.toLowerCase().includes(term) ||
        order.customer?.phone?.includes(term)
      );
    });
  }, [orders, search, statusFilter, dateRange]);

  const { page, setPage, totalPages, totalItems, pageSize, paginatedItems } =
    usePagination(filteredOrders);

  const pageIds = useMemo(() => paginatedItems.map((order) => order._id), [paginatedItems]);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const selectedCount = selectedIds.size;

  function toggleSelect(orderId) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  }

  function toggleSelectAllOnPage() {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allPageSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function handleSendToCourier(order) {
    if (order.steadfast?.tracking_code || order.steadfast?.consignment_id) {
      toast.error("এই অর্ডার আগেই Steadfast-এ পাঠানো হয়েছে");
      return;
    }

    setCourierOrderId(order._id);
    try {
      const updated = await sendToSteadfast(order._id);
      const tracking = updated?.steadfast?.tracking_code;
      toast.success(
        tracking
          ? `Steadfast-এ পাঠানো হয়েছে — Tracking: ${tracking}`
          : "Steadfast-এ সফলভাবে পাঠানো হয়েছে"
      );
    } catch (err) {
      toast.error(err.message || "Steadfast-এ পাঠানো যায়নি");
    } finally {
      setCourierOrderId(null);
    }
  }

  async function handleBulkCourier() {
    const selectedOrders = orders.filter((order) => selectedIds.has(order._id));
    if (!selectedOrders.length) return;

    setBulkCourierLoading(true);
    try {
      const data = await sendBulkToSteadfast(selectedOrders.map((order) => order._id));

      if (data.failedCount > 0) {
        toast.error(`${data.successCount}টি সফল, ${data.failedCount}টি ব্যর্থ`);
      } else {
        toast.success(`${data.successCount}টি অর্ডার Steadfast-এ পাঠানো হয়েছে`);
      }

      clearSelection();
    } catch (err) {
      toast.error(err.message || "বাল্ক Steadfast ব্যর্থ হয়েছে");
    } finally {
      setBulkCourierLoading(false);
    }
  }

  function handleDelete(order) {
    const displayId = formatDisplayOrderNumber(order.order_number);
    if (!window.confirm(`Delete order "${displayId}"? Stock will be restored.`)) return;
    deleteOrder(order._id);
    setSelectedIds((current) => {
      if (!current.has(order._id)) return current;
      const next = new Set(current);
      next.delete(order._id);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-indigo-600 uppercase">
            Fulfillment
          </p>
          <h1 className="text-xl font-bold text-dash-text sm:text-2xl">Orders</h1>
          <p className="mt-1 text-sm text-dash-muted">
            View, update status, and manage customer orders.
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <label htmlFor="order-date-filter" className="sr-only">
            Filter by date
          </label>
          <select
            id="order-date-filter"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            className={`${inputClass} w-full min-w-[180px] sm:w-52`}
          >
            {ORDER_DATE_FILTERS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-sm font-semibold text-dash-muted">
            {filteredOrders.length === orders.length
              ? `${orders.length} total orders`
              : `${filteredOrders.length} of ${orders.length} orders`}
          </p>
        </div>
      </motion.div>

      {dateFilter === "custom" ? (
        <div className="flex flex-col gap-3 rounded-md border border-dash-border bg-white p-3 sm:flex-row sm:items-end sm:p-4">
          <div className="flex-1">
            <label htmlFor="order-date-from" className="mb-1.5 block text-xs font-semibold text-dash-muted">
              From
            </label>
            <input
              id="order-date-from"
              type="date"
              value={customDateFrom}
              onChange={(event) => setCustomDateFrom(event.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="order-date-to" className="mb-1.5 block text-xs font-semibold text-dash-muted">
              To
            </label>
            <input
              id="order-date-to"
              type="date"
              value={customDateTo}
              min={customDateFrom || undefined}
              onChange={(event) => setCustomDateTo(event.target.value)}
              className={inputClass}
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setCustomDateFrom("");
              setCustomDateTo("");
            }}
            className="rounded-md border border-dash-border px-4 py-2.5 text-sm font-semibold text-dash-muted transition-colors hover:border-indigo-200 hover:text-indigo-700"
          >
            Clear
          </button>
        </div>
      ) : null}

      <div className="space-y-3">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by order ID, name, or phone..."
          className={`${inputClass} w-full`}
        />

        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`shrink-0 rounded-md border px-3.5 py-2 text-sm font-semibold transition-colors sm:px-4 ${
              statusFilter === "all"
                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                : "border-dash-border bg-white text-dash-muted hover:border-indigo-200 hover:text-indigo-700"
            }`}
          >
            All
          </button>
          {ORDER_STATUSES.map((entry) => {
            const active = statusFilter === entry.value;

            return (
              <button
                key={entry.value}
                type="button"
                onClick={() => setStatusFilter(entry.value)}
                className={`shrink-0 rounded-md border px-3.5 py-2 text-sm font-semibold transition-colors sm:px-4 ${
                  active
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                    : "border-dash-border bg-white text-dash-muted hover:border-indigo-200 hover:text-indigo-700"
                }`}
              >
                {entry.label}
              </button>
            );
          })}
        </div>
      </div>

      {selectedCount > 0 ? (
        <div className="flex flex-col gap-3 rounded-md border border-violet-200 bg-violet-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-violet-900">
            {selectedCount}টি অর্ডার নির্বাচিত
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleBulkCourier}
              disabled={bulkCourierLoading}
              className="inline-flex items-center gap-2 rounded-md bg-violet-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
            >
              {bulkCourierLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Truck className="h-4 w-4" />
              )}
              Steadfast-এ পাঠান
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="rounded-md border border-violet-200 bg-white px-3.5 py-2 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-100"
            >
              বাতিল
            </button>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="dash-card flex min-h-[280px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : isError ? (
        <div className="dash-card border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-600">{error?.message || "Failed to load orders."}</p>
          <button type="button" onClick={() => refetch()} className="mt-3 text-sm font-semibold text-indigo-600">
            Try again
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="dash-card flex min-h-[280px] flex-col items-center justify-center p-10 text-center">
          <ShoppingBag className="mb-4 h-10 w-10 text-indigo-600" />
          <h2 className="text-lg font-bold text-dash-text">
            {orders.length === 0 ? "No orders yet" : "No matching orders"}
          </h2>
          <p className="mt-2 text-sm text-dash-muted">
            {orders.length === 0
              ? "Customer orders will appear here after checkout."
              : "Try a different search or filter."}
          </p>
        </div>
      ) : (
        <div className="dash-card overflow-hidden">
          <MobileCardList className="p-3">
            {paginatedItems.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <MobileDashCard>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(order._id)}
                      onChange={() => toggleSelect(order._id)}
                      aria-label={`Select order ${formatDisplayOrderNumber(order.order_number)}`}
                      className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 accent-indigo-600"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-base font-bold text-indigo-600">
                            #{formatDisplayOrderNumber(order.order_number)}
                          </p>
                          <p className="mt-1 text-xs text-dash-muted">
                            {formatOrderDate(order.createdAt)}
                          </p>
                        </div>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-start justify-between gap-3 text-sm">
                          <span className="shrink-0 text-dash-muted">Customer</span>
                          <span className="min-w-0 text-right font-medium break-words text-dash-text">
                            <span className="block">{order.customer?.name}</span>
                            <span className="mt-1 inline-flex justify-end">
                              <RepeatCustomerBadge
                                phone={order.customer?.phone}
                                count={getRepeatCount(order.customer?.phone)}
                              />
                            </span>
                          </span>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold tracking-wide text-dash-muted uppercase">
                            Phone
                          </p>
                          <div className="mt-1">
                            <CustomerPhoneActions phone={order.customer?.phone} />
                          </div>
                        </div>
                        <MobileDashRow label="Total" value={formatOrderTotal(order)} />
                        <MobileDashRow label="Items" value={getOrderItemSummary(order)} />
                      </div>
                      <div className="mt-3 flex justify-end">
                        <OrderRowActions
                          order={order}
                          onView={setViewOrder}
                          onEdit={setEditOrder}
                          onDelete={handleDelete}
                          onCourier={handleSendToCourier}
                          isDeleting={isDeleting && deletingId === order._id}
                          isSendingCourier={courierOrderId === order._id}
                        />
                      </div>
                    </div>
                  </div>
                </MobileDashCard>
              </motion.div>
            ))}
          </MobileCardList>

          <DesktopTable>
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-dash-border bg-slate-50 text-[11px] font-semibold tracking-wide text-dash-muted uppercase">
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={allPageSelected}
                      onChange={toggleSelectAllOnPage}
                      aria-label="Select all orders on this page"
                      className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
                    />
                  </th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((order, index) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`border-b border-dash-border last:border-b-0 hover:bg-slate-50/80 ${
                      selectedIds.has(order._id) ? "bg-indigo-50/40" : ""
                    }`}
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(order._id)}
                        onChange={() => toggleSelect(order._id)}
                        aria-label={`Select order ${formatDisplayOrderNumber(order.order_number)}`}
                        className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
                      />
                    </td>
                    <td className="px-4 py-3 font-bold text-indigo-600">
                      #{formatDisplayOrderNumber(order.order_number)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-dash-text">{order.customer?.name}</p>
                        <RepeatCustomerBadge
                          phone={order.customer?.phone}
                          count={getRepeatCount(order.customer?.phone)}
                        />
                      </div>
                      <div className="mt-1">
                        <CustomerPhoneActions phone={order.customer?.phone} />
                      </div>
                    </td>
                    <td className="max-w-[180px] truncate px-4 py-3 text-dash-muted">
                      {getOrderItemSummary(order)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-dash-text">{formatOrderTotal(order)}</td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-dash-muted whitespace-nowrap">
                      {formatOrderDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <OrderRowActions
                        order={order}
                        onView={setViewOrder}
                        onEdit={setEditOrder}
                        onDelete={handleDelete}
                        onCourier={handleSendToCourier}
                        isDeleting={isDeleting && deletingId === order._id}
                        isSendingCourier={courierOrderId === order._id}
                      />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </DesktopTable>
          <TablePagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      )}

      <OrderViewModal open={Boolean(viewOrder)} order={viewOrder} onClose={() => setViewOrder(null)} />
      <OrderEditModal open={Boolean(editOrder)} order={editOrder} onClose={() => setEditOrder(null)} />
    </div>
  );
}
