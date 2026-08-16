"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import OrderEditModal from "@/components/dashboard/OrderEditModal";
import StatusBadge from "@/components/dashboard/StatusBadge";
import {
  useAdminOrders,
  useDeleteAdminOrder,
  useSendBulkOrdersToSteadfast,
  useSendOrderToSteadfast,
} from "@/hooks/useAdminOrders";
import { usePagination } from "@/hooks/usePagination";
import TablePagination from "@/components/dashboard/TablePagination";
import DashPageHeader from "@/components/dashboard/DashPageHeader";
import {
  DesktopTable,
  MobileCardList,
  MobileDashCard,
  MobileDashRow,
} from "@/components/shared/ResponsiveTable";
import {
  formatDisplayOrderNumber,
  formatOrderDate,
  formatOrderTotal,
  getOrderDateRange,
  getOrderItemSummary,
  getSteadfastTrackingUrl,
  getWhatsAppPhoneUrl,
  isOrderInDateRange,
  normalizeOrderStatus,
  ORDER_DATE_FILTERS,
  ORDER_STATUSES,
} from "@/lib/orderHelpers";
import { normalizePhone } from "@/lib/orderValidation";
import { SITE_NAME } from "@/lib/siteMetadata";

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
          <h1 class="title">${SITE_NAME}</h1>
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
    <Typography
      variant="caption"
      fontWeight={800}
      color="text.secondary"
      sx={{
        display: "block",
        borderBottom: 1,
        borderColor: "divider",
        pb: 1,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </Typography>
  );
}

function CopyableValue({ label, value }) {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <Button
      type="button"
      size="small"
      variant="outlined"
      color="success"
      onClick={handleCopy}
      title={`Copy ${label}`}
      endIcon={<ContentCopyRoundedIcon sx={{ fontSize: "14px !important" }} />}
      sx={{ justifyContent: "flex-start", textTransform: "none", fontWeight: 700, fontSize: 12 }}
    >
      {label}: {value}
    </Button>
  );
}

function SteadfastTrackingActions({ trackingCode }) {
  const code = String(trackingCode || "").trim();
  const trackingUrl = getSteadfastTrackingUrl(code);

  if (!code || !trackingUrl) return null;

  async function copyTrackingCode() {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Tracking code copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
      <Button
        component="a"
        href={trackingUrl}
        target="_blank"
        rel="noopener noreferrer"
        size="small"
        variant="outlined"
        startIcon={<OpenInNewRoundedIcon sx={{ fontSize: "14px !important" }} />}
        sx={{ textTransform: "none", fontWeight: 700, fontSize: 12 }}
      >
        Open tracking
      </Button>
      <IconButton
        size="small"
        onClick={copyTrackingCode}
        title="Copy tracking code"
        aria-label="Copy tracking code"
        sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}
      >
        <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
      </IconButton>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {code}
      </Typography>
    </Stack>
  );
}

function CustomerPhoneActions({ phone }) {
  if (!phone) {
    return (
      <Typography variant="caption" color="text.secondary">
        —
      </Typography>
    );
  }

  async function copyPhone() {
    try {
      await navigator.clipboard.writeText(phone);
      toast.success("Number copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  const whatsappUrl = getWhatsAppPhoneUrl(phone);
  const iconSx = { border: 1, borderColor: "divider", borderRadius: 1 };

  return (
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {phone}
      </Typography>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <IconButton
          size="small"
          onClick={copyPhone}
          title="Copy"
          aria-label="Copy phone number"
          sx={iconSx}
        >
          <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
        </IconButton>
        <IconButton
          component="a"
          href={`tel:${phone}`}
          size="small"
          title="Call"
          aria-label="Call"
          color="success"
          sx={{ ...iconSx, borderColor: "success.light", bgcolor: "rgba(46, 125, 50, 0.06)" }}
        >
          <PhoneOutlinedIcon sx={{ fontSize: 16 }} />
        </IconButton>
        {whatsappUrl ? (
          <IconButton
            component="a"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            title="WhatsApp"
            aria-label="WhatsApp"
            sx={{ ...iconSx, borderColor: "success.light", bgcolor: "rgba(46, 125, 50, 0.06)", color: "success.dark" }}
          >
            <WhatsAppIcon sx={{ fontSize: 16 }} />
          </IconButton>
        ) : null}
      </Stack>
    </Stack>
  );
}

function OrderViewModal({ open, onClose, order }) {
  if (!order) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper" slotProps={{ paper: { sx: { maxHeight: "92dvh" } } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, pr: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          Order {formatDisplayOrderNumber(order.order_number)}
        </Typography>
        <IconButton aria-label="Close modal" onClick={onClose} size="small">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ py: 1 }}>
          <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                Order ID
              </Typography>
              <Typography variant="h6" fontWeight={800} color="primary.main" sx={{ mt: 0.5 }}>
                {formatDisplayOrderNumber(order.order_number)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                {formatOrderDate(order.createdAt)}
              </Typography>
            </Box>
            <StatusBadge status={order.status} />
          </Stack>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            }}
          >
            <Paper variant="outlined" sx={{ p: 2 }}>
              <SectionTitle>Customer</SectionTitle>
              <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {order.customer?.name}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Phone
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <CustomerPhoneActions phone={order.customer?.phone} />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Address
                  </Typography>
                  <Typography variant="body2">{order.customer?.address}</Typography>
                </Box>
                {order.customer?.delivery_area ? (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Delivery Area
                    </Typography>
                    <Typography variant="body2">{order.customer.delivery_area}</Typography>
                  </Box>
                ) : null}
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <SectionTitle>Delivery & Payment</SectionTitle>
              <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Delivery
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {order.delivery?.label} — ৳{order.delivery?.charge?.toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Payment
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {order.payment?.label || "Cash On Delivery"}
                  </Typography>
                </Box>
                {order.steadfast?.tracking_code || order.steadfast?.consignment_id ? (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Steadfast
                    </Typography>
                    <Stack spacing={1} sx={{ mt: 0.5 }}>
                      {order.steadfast.tracking_code ? (
                        <SteadfastTrackingActions trackingCode={String(order.steadfast.tracking_code)} />
                      ) : null}
                      {order.steadfast.consignment_id ? (
                        <CopyableValue
                          label="Consignment ID"
                          value={String(order.steadfast.consignment_id)}
                        />
                      ) : null}
                    </Stack>
                  </Box>
                ) : null}
              </Stack>
            </Paper>
          </Box>

          <Box>
            <SectionTitle>Items</SectionTitle>
            <Stack spacing={1.5} sx={{ mt: 1.5 }}>
              {(order.items || []).map((item, index) => (
                <Paper
                  key={`${item.product_id}-${item.selected_variant}-${index}`}
                  variant="outlined"
                  sx={{ p: 1.5, display: "flex", gap: 1.5 }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: 64,
                      height: 64,
                      flexShrink: 0,
                      borderRadius: 1,
                      bgcolor: "grey.100",
                      overflow: "hidden",
                    }}
                  >
                    {item.image ? (
                      <Image src={item.image} alt={item.title} fill unoptimized className="object-contain p-1" />
                    ) : (
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 1, color: "text.disabled" }}>
                        <ShoppingBagOutlinedIcon sx={{ opacity: 0.4 }} />
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography fontWeight={700}>{item.title}</Typography>
                    {item.selected_variant ? (
                      <Typography variant="caption" color="text.secondary">
                        Variant: {item.selected_variant}
                      </Typography>
                    ) : null}
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      ৳{item.price?.toLocaleString()} × {item.quantity}
                      {item.discount > 0 ? ` − ৳${item.discount.toLocaleString()} disc.` : ""} ={" "}
                      <Box component="span" fontWeight={700} color="text.primary">
                        ৳{item.line_total?.toLocaleString()}
                      </Box>
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Box>

          <Paper variant="outlined" sx={{ bgcolor: "grey.50", p: 2 }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Subtotal
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                ৳{order.pricing?.subtotal?.toLocaleString()}
              </Typography>
            </Stack>
            {order.pricing?.discount > 0 ? (
              <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                <Typography variant="body2" color="success.main">
                  Discount
                </Typography>
                <Typography variant="body2" fontWeight={700} color="success.main">
                  -৳{order.pricing.discount.toLocaleString()}
                </Typography>
              </Stack>
            ) : null}
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Delivery
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                ৳{order.pricing?.delivery_charge?.toLocaleString()}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: "divider" }}
            >
              <Typography fontWeight={800}>Total</Typography>
              <Typography variant="h6" fontWeight={800} color="primary.main">
                {formatOrderTotal(order)}
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      </DialogContent>
    </Dialog>
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
  const consignmentId = getSteadfastConsignmentId(order);
  const trackingCode = getSteadfastTrackingCode(order);
  const alreadySent = Boolean(consignmentId || trackingCode);
  const iconSx = { border: 1, borderRadius: 1 };

  async function copyConsignmentId() {
    if (!consignmentId) return;

    try {
      await navigator.clipboard.writeText(consignmentId);
      toast.success("Consignment ID copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" alignItems="center">
      <IconButton
        size="small"
        title="Print Invoice"
        aria-label="Print Invoice"
        onClick={() =>
          openPrintWindow({
            title: `Invoice ${order.order_number}`,
            pageSize: "A5",
            html: buildInvoiceHtml(order),
          })
        }
        color="primary"
        sx={{ ...iconSx, borderColor: "primary.light", bgcolor: "rgba(63, 81, 181, 0.06)" }}
      >
        <DescriptionOutlinedIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        title="Print Sticker"
        aria-label="Print Sticker"
        onClick={() =>
          openPrintWindow({
            title: `Sticker ${order.order_number}`,
            pageSize: "2in 3in",
            html: buildStickerHtml(order),
          })
        }
        color="success"
        sx={{ ...iconSx, borderColor: "success.light", bgcolor: "rgba(46, 125, 50, 0.06)" }}
      >
        <SellOutlinedIcon fontSize="small" />
      </IconButton>
      {alreadySent ? (
        consignmentId ? (
          <Button
            size="small"
            variant="outlined"
            color="success"
            onClick={copyConsignmentId}
            title="Copy consignment ID"
            aria-label="Copy consignment ID"
            startIcon={<ContentCopyRoundedIcon sx={{ fontSize: "14px !important" }} />}
            sx={{
              maxWidth: { xs: 140, sm: 160 },
              textTransform: "none",
              fontWeight: 700,
              fontSize: 11,
              "& .MuiButton-startIcon": { mr: 0.5 },
            }}
          >
            <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {consignmentId}
            </Box>
          </Button>
        ) : null
      ) : (
        <Button
          size="small"
          variant="outlined"
          color="secondary"
          onClick={() => onCourier(order)}
          disabled={isSendingCourier}
          title="Send to Steadfast"
          aria-label="Send to courier"
          startIcon={
            isSendingCourier ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <LocalShippingOutlinedIcon sx={{ fontSize: "16px !important" }} />
            )
          }
          sx={{ textTransform: "none", fontWeight: 700, fontSize: 11, minWidth: 0 }}
        >
          <Box component="span" sx={{ display: { xs: "none", xl: "inline" } }}>
            Send to courier
          </Box>
        </Button>
      )}
      <IconButton
        size="small"
        aria-label="View order"
        title="View"
        onClick={() => onView(order)}
        sx={iconSx}
      >
        <VisibilityOutlinedIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        aria-label="Edit order"
        title="Edit"
        onClick={() => onEdit(order)}
        color="primary"
        sx={{ ...iconSx, borderColor: "primary.light", bgcolor: "rgba(63, 81, 181, 0.06)" }}
      >
        <EditOutlinedIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        aria-label="Delete order"
        title="Delete"
        onClick={() => onDelete(order)}
        disabled={isDeleting}
        color="error"
        sx={{ ...iconSx, borderColor: "error.light", bgcolor: "rgba(211, 47, 47, 0.06)" }}
      >
        {isDeleting ? (
          <CircularProgress size={16} color="inherit" />
        ) : (
          <DeleteOutlineRoundedIcon fontSize="small" />
        )}
      </IconButton>
    </Stack>
  );
}

function RepeatCustomerBadge({ phone, count }) {
  if (!phone || count < 2) return null;

  return (
    <Chip
      component={Link}
      href={`/dashboard/reports/repeat-customers?phone=${encodeURIComponent(phone)}`}
      clickable
      size="small"
      color="error"
      variant="outlined"
      label="Repeat customer"
      title="Repeat customer report"
      sx={{ height: 22, fontSize: 10, fontWeight: 700 }}
    />
  );
}

function CourierIdCell({ order }) {
  const courierId = getCourierId(order);
  if (!courierId) {
    return <Chip size="small" label="No CN" variant="outlined" sx={{ fontSize: 10, fontWeight: 700, color: "text.disabled" }} />;
  }

  return (
    <Chip
      size="small"
      color="success"
      variant="outlined"
      label={courierId}
      sx={{ fontSize: 11, fontWeight: 700 }}
    />
  );
}

function ReportViewAction({ order, onView }) {
  return (
    <IconButton
      size="small"
      onClick={() => onView(order)}
      title="View"
      aria-label="View order"
      sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}
    >
      <VisibilityOutlinedIcon fontSize="small" />
    </IconButton>
  );
}

export default function OrdersManager({ initialSearch = "", reportMode = false }) {
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
      toast.error("This order was already sent to Steadfast");
      return;
    }

    setCourierOrderId(order._id);
    try {
      const updated = await sendToSteadfast(order._id);
      const tracking = updated?.steadfast?.tracking_code;
      toast.success(
        tracking
          ? `Sent to Steadfast — Tracking: ${tracking}`
          : "Successfully sent to Steadfast"
      );
    } catch (err) {
      toast.error(err.message || "Failed to send to Steadfast");
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
        toast.error(`${data.successCount} succeeded, ${data.failedCount} failed`);
      } else {
        toast.success(`${data.successCount} orders sent to Steadfast`);
      }

      clearSelection();
    } catch (err) {
      toast.error(err.message || "Bulk Steadfast send failed");
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
    <Stack spacing={3}>
      {!reportMode ? (
        <DashPageHeader
          eyebrow="Fulfillment"
          title="Orders"
          description="View, update status, and manage customer orders."
          action={
            <Stack spacing={1} sx={{ alignItems: { sm: "flex-end" } }}>
              <FormControl size="small" sx={{ minWidth: { sm: 208 }, width: { xs: 1, sm: "auto" } }}>
                <InputLabel id="order-date-filter-label">Filter by date</InputLabel>
                <Select
                  labelId="order-date-filter-label"
                  id="order-date-filter"
                  label="Filter by date"
                  value={dateFilter}
                  onChange={(event) => setDateFilter(event.target.value)}
                >
                  {ORDER_DATE_FILTERS.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="body2" fontWeight={700} color="text.secondary">
                {filteredOrders.length === orders.length
                  ? `${orders.length} total orders`
                  : `${filteredOrders.length} of ${orders.length} orders`}
              </Typography>
            </Stack>
          }
        />
      ) : null}

      {!reportMode && dateFilter === "custom" ? (
        <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "flex-end" }}>
            <TextField
              id="order-date-from"
              label="From"
              type="date"
              size="small"
              fullWidth
              value={customDateFrom}
              onChange={(event) => setCustomDateFrom(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              id="order-date-to"
              label="To"
              type="date"
              size="small"
              fullWidth
              value={customDateTo}
              onChange={(event) => setCustomDateTo(event.target.value)}
              slotProps={{
                htmlInput: { min: customDateFrom || undefined },
                inputLabel: { shrink: true },
              }}
            />
            <Button
              type="button"
              variant="outlined"
              color="inherit"
              onClick={() => {
                setCustomDateFrom("");
                setCustomDateTo("");
              }}
              sx={{ flexShrink: 0 }}
            >
              Clear
            </Button>
          </Stack>
        </Paper>
      ) : null}

      {!reportMode ? (
        <Stack spacing={1.5}>
          <TextField
            type="search"
            size="small"
            fullWidth
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by order ID, name, or phone..."
          />

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{
              overflowX: "auto",
              pb: 0.5,
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            <Button
              type="button"
              size="small"
              variant={statusFilter === "all" ? "contained" : "outlined"}
              color={statusFilter === "all" ? "primary" : "inherit"}
              onClick={() => setStatusFilter("all")}
              sx={{ flexShrink: 0, textTransform: "none", fontWeight: 700 }}
            >
              All
            </Button>
            {ORDER_STATUSES.map((entry) => {
              const active = statusFilter === entry.value;

              return (
                <Button
                  key={entry.value}
                  type="button"
                  size="small"
                  variant={active ? "contained" : "outlined"}
                  color={active ? "primary" : "inherit"}
                  onClick={() => setStatusFilter(entry.value)}
                  sx={{ flexShrink: 0, textTransform: "none", fontWeight: 700 }}
                >
                  {entry.label}
                </Button>
              );
            })}
          </Stack>
        </Stack>
      ) : null}

      {selectedCount > 0 ? (
        <Paper
          variant="outlined"
          sx={{
            borderColor: "secondary.light",
            bgcolor: "rgba(156, 39, 176, 0.06)",
            px: 2,
            py: 1.5,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ sm: "center" }}
            justifyContent="space-between"
          >
            <Typography variant="body2" fontWeight={700} color="secondary.dark">
              {selectedCount} orders selected
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Button
                type="button"
                variant="contained"
                color="secondary"
                onClick={handleBulkCourier}
                disabled={bulkCourierLoading}
                startIcon={
                  bulkCourierLoading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <LocalShippingOutlinedIcon />
                  )
                }
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Send to Steadfast
              </Button>
              <Button
                type="button"
                variant="outlined"
                color="secondary"
                onClick={clearSelection}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Paper>
      ) : null}

      {isLoading ? (
        <Paper
          variant="outlined"
          sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 280 }}
        >
          <CircularProgress />
        </Paper>
      ) : isError ? (
        <Paper variant="outlined" sx={{ borderColor: "error.light", bgcolor: "rgba(211, 47, 47, 0.04)", p: 3, textAlign: "center" }}>
          <Typography variant="body2" color="error.main">
            {error?.message || "Failed to load orders."}
          </Typography>
          <Button type="button" onClick={() => refetch()} sx={{ mt: 1.5, fontWeight: 700 }}>
            Try again
          </Button>
        </Paper>
      ) : filteredOrders.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 280,
            p: 5,
            textAlign: "center",
          }}
        >
          <ShoppingBagOutlinedIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
          <Typography variant="h6" fontWeight={800}>
            {orders.length === 0 ? "No orders yet" : "No matching orders"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {orders.length === 0
              ? "Customer orders will appear here after checkout."
              : "Try a different search or filter."}
          </Typography>
        </Paper>
      ) : reportMode ? (
        <Paper variant="outlined" sx={{ overflow: "hidden" }}>
          <MobileCardList>
            {paginatedItems.map((order, index) => (
              <Box
                key={order._id}
                component={motion.div}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                sx={{ borderBottom: 1, borderColor: "divider", p: 2 }}
              >
                <Stack direction="row" spacing={1.5} justifyContent="space-between" alignItems="flex-start">
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography fontWeight={800} color="primary.main">
                      #{formatDisplayOrderNumber(order.order_number)}
                    </Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5 }}>
                      {order.customer?.name || "—"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.customer?.phone || "—"}
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center" sx={{ mt: 1 }}>
                      <CourierIdCell order={order} />
                      <Typography variant="caption" color="text.secondary">
                        {formatOrderDate(order.createdAt)}
                      </Typography>
                    </Stack>
                  </Box>
                  <ReportViewAction order={order} onView={setViewOrder} />
                </Stack>
              </Box>
            ))}
          </MobileCardList>

          <DesktopTable>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell>Order</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Courier ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">View</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedItems.map((order, index) => (
                  <TableRow key={order._id} sx={{ bgcolor: index % 2 === 0 ? "background.paper" : "grey.50" }}>
                    <TableCell>
                      <Typography fontWeight={700} color="primary.main">
                        #{formatDisplayOrderNumber(order.order_number)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={700}>{order.customer?.name || "—"}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.customer?.phone || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <CourierIdCell order={order} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                        {formatOrderDate(order.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <ReportViewAction order={order} onView={setViewOrder} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DesktopTable>
          <TablePagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ overflow: "hidden" }}>
          <MobileCardList>
            <Stack spacing={1.5} sx={{ p: 1.5 }}>
              {paginatedItems.map((order, index) => (
                <Box
                  key={order._id}
                  component={motion.div}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <MobileDashCard>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Checkbox
                        size="small"
                        checked={selectedIds.has(order._id)}
                        onChange={() => toggleSelect(order._id)}
                        slotProps={{
                          input: {
                            "aria-label": `Select order ${formatDisplayOrderNumber(order.order_number)}`,
                          },
                        }}
                        sx={{ mt: 0.25, p: 0.5 }}
                      />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="flex-start">
                          <Box sx={{ minWidth: 0 }}>
                            <Typography fontWeight={800} color="primary.main">
                              #{formatDisplayOrderNumber(order.order_number)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                              {formatOrderDate(order.createdAt)}
                            </Typography>
                          </Box>
                          <StatusBadge status={order.status} />
                        </Stack>
                        <Stack spacing={1} sx={{ mt: 1.5 }}>
                          <Stack direction="row" spacing={1.5} justifyContent="space-between" alignItems="flex-start">
                            <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                              Customer
                            </Typography>
                            <Box sx={{ textAlign: "right", minWidth: 0 }}>
                              <Typography variant="body2" fontWeight={600}>
                                {order.customer?.name}
                              </Typography>
                              <Box sx={{ mt: 0.5, display: "inline-flex", justifyContent: "flex-end" }}>
                                <RepeatCustomerBadge
                                  phone={order.customer?.phone}
                                  count={getRepeatCount(order.customer?.phone)}
                                />
                              </Box>
                            </Box>
                          </Stack>
                          <Box>
                            <Typography
                              variant="caption"
                              fontWeight={700}
                              color="text.secondary"
                              sx={{ letterSpacing: "0.06em", textTransform: "uppercase" }}
                            >
                              Phone
                            </Typography>
                            <Box sx={{ mt: 0.5 }}>
                              <CustomerPhoneActions phone={order.customer?.phone} />
                            </Box>
                          </Box>
                          <MobileDashRow label="Total" value={formatOrderTotal(order)} />
                          <MobileDashRow label="Items" value={getOrderItemSummary(order)} />
                        </Stack>
                        <Box sx={{ mt: 1.5, display: "flex", justifyContent: "flex-end" }}>
                          <OrderRowActions
                            order={order}
                            onView={setViewOrder}
                            onEdit={setEditOrder}
                            onDelete={handleDelete}
                            onCourier={handleSendToCourier}
                            isDeleting={isDeleting && deletingId === order._id}
                            isSendingCourier={courierOrderId === order._id}
                          />
                        </Box>
                      </Box>
                    </Stack>
                  </MobileDashCard>
                </Box>
              ))}
            </Stack>
          </MobileCardList>

          <DesktopTable>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      checked={allPageSelected}
                      onChange={toggleSelectAllOnPage}
                      slotProps={{ input: { "aria-label": "Select all orders on this page" } }}
                    />
                  </TableCell>
                  <TableCell>Order</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedItems.map((order, index) => (
                  <TableRow
                    key={order._id}
                    component={motion.tr}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    hover
                    selected={selectedIds.has(order._id)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        size="small"
                        checked={selectedIds.has(order._id)}
                        onChange={() => toggleSelect(order._id)}
                        slotProps={{
                          input: {
                            "aria-label": `Select order ${formatDisplayOrderNumber(order.order_number)}`,
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={800} color="primary.main">
                        #{formatDisplayOrderNumber(order.order_number)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                        <Typography fontWeight={700}>{order.customer?.name}</Typography>
                        <RepeatCustomerBadge
                          phone={order.customer?.phone}
                          count={getRepeatCount(order.customer?.phone)}
                        />
                      </Stack>
                      <Box sx={{ mt: 0.5 }}>
                        <CustomerPhoneActions phone={order.customer?.phone} />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {getOrderItemSummary(order)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={700}>{formatOrderTotal(order)}</Typography>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                        {formatOrderDate(order.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <OrderRowActions
                        order={order}
                        onView={setViewOrder}
                        onEdit={setEditOrder}
                        onDelete={handleDelete}
                        onCourier={handleSendToCourier}
                        isDeleting={isDeleting && deletingId === order._id}
                        isSendingCourier={courierOrderId === order._id}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DesktopTable>
          <TablePagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </Paper>
      )}

      <OrderViewModal open={Boolean(viewOrder)} order={viewOrder} onClose={() => setViewOrder(null)} />
      <OrderEditModal open={Boolean(editOrder)} order={editOrder} onClose={() => setEditOrder(null)} />
    </Stack>
  );
}
