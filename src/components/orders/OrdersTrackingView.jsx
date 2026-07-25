"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import StoreContainer from "@/components/container/StoreContainer";
import StoreShell from "@/components/layout/StoreShell";
import { fetchOrdersByPhone } from "@/lib/api/orders";
import { isValidBdPhone, normalizePhone } from "@/lib/orderValidation";
import {
  formatDisplayOrderNumber,
  getOrderTrackingInfo,
  normalizeOrderStatus,
  ORDER_TRACKING_STEPS,
} from "@/lib/orderHelpers";

const TRACKING_ORDER_LIMIT = 5;

const STATUS_CHIP_SX = {
  new: { bgcolor: "grey.100", color: "grey.800" },
  confirmed: { bgcolor: "info.50", color: "info.dark" },
  steadfast_entered: { bgcolor: "primary.50", color: "primary.dark" },
  no_response: { bgcolor: "warning.50", color: "warning.dark" },
  will_inform_later: { bgcolor: "warning.50", color: "warning.dark" },
  color_code_pending: { bgcolor: "#f5f3ff", color: "#6d28d9" },
  out_for_delivery: { bgcolor: "success.50", color: "success.dark" },
  scammer: { bgcolor: "error.50", color: "error.main" },
  pending: { bgcolor: "grey.100", color: "grey.800" },
  processing: { bgcolor: "info.50", color: "info.dark" },
  shipped: { bgcolor: "primary.50", color: "primary.dark" },
  delivered: { bgcolor: "success.50", color: "success.dark" },
  cancelled: { bgcolor: "error.50", color: "error.main" },
};

function mapOrderToView(order) {
  const statusInfo = getOrderTrackingInfo(order.status);
  const items = order.items || [];

  return {
    _id: order._id,
    id: formatDisplayOrderNumber(order.order_number),
    customer: order.customer?.name || "—",
    phone: order.customer?.phone || "",
    items: items.map((item) => ({
      title: item.title || "Product",
      quantity: item.quantity || 1,
      line_total: item.line_total || (item.price || 0) * (item.quantity || 1),
    })),
    total: Number(order.pricing?.total || 0),
    totalFormatted: `৳ ${Number(order.pricing?.total || 0).toLocaleString()}`,
    paymentLabel: order.payment?.label || "Cash on Delivery",
    status: order.status,
    statusLabel: statusInfo.label,
    dateTime: order.createdAt
      ? new Date(order.createdAt).toLocaleString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "—",
    address: order.customer?.address || "—",
    currentStep: statusInfo.step,
  };
}

function StatusBadge({ status, label }) {
  const normalized = normalizeOrderStatus(status);
  const chipSx = STATUS_CHIP_SX[normalized] || STATUS_CHIP_SX.new;

  return <Chip label={label} size="small" sx={{ fontWeight: 600, fontSize: 11, ...chipSx }} />;
}

function OrderProgressStepper({ currentStep }) {
  if (currentStep <= 0) return null;

  return (
    <Box sx={{ position: "relative", mt: 3, pt: 3, borderTop: 1, borderColor: "grey.100" }}>
      <Box
        sx={{
          display: { xs: "none", sm: "block" },
          position: "absolute",
          top: "calc(1.5rem + 0.75rem)",
          left: "10%",
          right: "10%",
          height: 2,
          bgcolor: "grey.200",
        }}
      />
      <Grid container spacing={1}>
        {ORDER_TRACKING_STEPS.map((label, index) => {
          const stepNum = index + 1;
          const done = stepNum <= currentStep;

          return (
            <Grid key={label} size={{ xs: 6, sm: 3 }}>
              <Stack sx={{ alignItems: "center", textAlign: "center" }}>
                <Box
                  sx={{
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: { xs: 24, sm: 28 },
                    height: { xs: 24, sm: 28 },
                    borderRadius: 1,
                    border: 2,
                    borderColor: done ? "primary.main" : "grey.300",
                    bgcolor: done ? "primary.main" : "background.paper",
                    color: done ? "common.white" : "grey.300",
                  }}
                >
                  {done ? <CheckRoundedIcon sx={{ fontSize: { xs: 14, sm: 16 } }} /> : null}
                </Box>
                <Typography variant="caption" fontWeight={500} color={done ? "text.primary" : "text.disabled"} sx={{ mt: 1, lineHeight: 1.3 }}>
                  {label}
                </Typography>
              </Stack>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

function OrderTrackingCard({ order, index }) {
  async function copyOrderId() {
    try {
      await navigator.clipboard.writeText(order.id);
      toast.success("Order ID copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <Paper
      component={motion.article}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      variant="outlined"
      sx={{ overflow: "hidden" }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ sm: "flex-start" }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ borderBottom: 1, borderColor: "grey.100", px: { xs: 1.5, sm: 2.5 }, py: 2 }}
      >
        <Box>
          <Stack direction="row" alignItems="center" flexWrap="wrap" spacing={1}>
            <Typography variant="h6" fontWeight={700}>
              Order {order.id}
            </Typography>
            <IconButton size="small" onClick={copyOrderId} aria-label="Copy order ID" color="primary">
              <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {order.dateTime}
          </Typography>
        </Box>
        <StatusBadge status={order.status} label={order.statusLabel} />
      </Stack>

      <Grid container spacing={2} sx={{ borderBottom: 1, borderColor: "grey.100", px: { xs: 1.5, sm: 2.5 }, py: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography variant="caption" fontWeight={700} color="text.disabled" sx={{ letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Customer
          </Typography>
          <Typography variant="body2" fontWeight={700} sx={{ mt: 0.75 }}>
            {order.customer}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {order.phone}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography variant="caption" fontWeight={700} color="text.disabled" sx={{ letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Shipping Address
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.75, lineHeight: 1.6 }}>
            {order.address}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography variant="caption" fontWeight={700} color="text.disabled" sx={{ letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Payment
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.75 }}>
            {order.paymentLabel}
          </Typography>
          <Typography variant="body1" fontWeight={700} sx={{ mt: 0.5 }}>
            {order.totalFormatted}
          </Typography>
        </Grid>
      </Grid>

      <Box sx={{ display: { xs: "block", md: "none" } }}>
        {order.items.map((item, itemIndex) => (
          <Stack
            key={`${item.title}-${itemIndex}`}
            direction="row"
            justifyContent="space-between"
            spacing={1.5}
            sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "grey.100" }}
          >
            <Typography variant="body2" fontWeight={500} sx={{ flex: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {item.title}
            </Typography>
            <Box sx={{ textAlign: "right", flexShrink: 0 }}>
              <Typography variant="caption" color="text.secondary">
                ×{item.quantity}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                ৳{item.line_total.toLocaleString()}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Box>

      <Box sx={{ display: { xs: "none", md: "block" }, overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <TableCell>Product</TableCell>
              <TableCell align="center" sx={{ width: 80 }}>
                Qty
              </TableCell>
              <TableCell sx={{ width: 112 }}>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {order.items.map((item, itemIndex) => (
              <TableRow key={`${item.title}-${itemIndex}`}>
                <TableCell sx={{ fontWeight: 500, maxWidth: 0 }}>
                  <Typography variant="body2" sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {item.title}
                  </Typography>
                </TableCell>
                <TableCell align="center">{item.quantity}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>৳ {item.line_total.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Box sx={{ px: { xs: 2, sm: 2.5 }, pb: 2.5 }}>
        <OrderProgressStepper currentStep={order.currentStep} />
      </Box>
    </Paper>
  );
}

export default function OrdersTrackingView() {
  return (
    <Suspense fallback={<OrdersTrackingFallback />}>
      <OrdersTrackingContent />
    </Suspense>
  );
}

function OrdersTrackingFallback() {
  return (
    <StoreShell sx={{ bgcolor: "grey.50" }}>
      <Box component="section" sx={{ py: { xs: 3, sm: 4, lg: 5 } }}>
        <StoreContainer>
          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Skeleton width={160} height={28} />
            <Skeleton width={260} height={20} sx={{ mt: 1 }} />
            <Skeleton height={44} sx={{ mt: 2 }} />
          </Paper>
        </StoreContainer>
      </Box>
    </StoreShell>
  );
}

function OrdersTrackingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneParam = normalizePhone(searchParams.get("phone") || "");

  const [phone, setPhone] = useState(phoneParam);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(phoneParam));
  const fetchedPhoneRef = useRef("");

  const trackByPhone = useCallback(
    async (rawPhone, updateUrl = true) => {
      const normalized = normalizePhone(rawPhone);

      if (!normalized) {
        setError("Please enter a phone number");
        return;
      }

      if (!isValidBdPhone(normalized)) {
        setError("Enter a valid Bangladeshi mobile number (01XXXXXXXXX)");
        return;
      }

      setError("");
      setOrders([]);
      setLoading(true);
      setHasSearched(true);
      fetchedPhoneRef.current = normalized;

      try {
        const result = await fetchOrdersByPhone(normalized);
        setOrders(result.map(mapOrderToView));

        if (updateUrl) {
          const params = new URLSearchParams();
          params.set("phone", normalized);
          router.replace(`/orders-traking?${params.toString()}`, { scroll: false });
        }
      } catch (err) {
        setError(err.message || "No orders found");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    if (!phoneParam || fetchedPhoneRef.current === phoneParam) return;
    setPhone(phoneParam);
    trackByPhone(phoneParam, false);
  }, [phoneParam, trackByPhone]);

  function handleTrack(event) {
    event.preventDefault();
    trackByPhone(phone);
  }

  const hintCards = [
    { icon: PhoneOutlinedIcon, title: "Enter phone number", desc: "Use the number from checkout" },
    { icon: SearchRoundedIcon, title: "Search", desc: "See your latest 5 orders" },
    { icon: LocalShippingOutlinedIcon, title: "Check status", desc: "Product table and progress bar" },
  ];

  return (
    <StoreShell sx={{ bgcolor: "grey.50" }}>
      <Box component="section" sx={{ py: { xs: 3, sm: 4, lg: 5 } }}>
        <StoreContainer>
          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Typography variant="h6" fontWeight={700}>
              Track Your Order
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              View your latest {TRACKING_ORDER_LIMIT} orders with your checkout phone number
            </Typography>

            <Box component="form" onSubmit={handleTrack} sx={{ mt: 2 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                <TextField
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(event) => setPhone(normalizePhone(event.target.value))}
                  placeholder="01XXXXXXXXX"
                  required
                  fullWidth
                  size="small"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ borderRight: 1, borderColor: "divider", pr: 1 }}>
                            +88
                          </Typography>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <Button type="submit" variant="contained" disabled={loading} startIcon={<SearchRoundedIcon />} sx={{ flexShrink: 0 }}>
                  {loading ? "Searching..." : "Search"}
                </Button>
              </Stack>
            </Box>
          </Paper>

          <Box sx={{ mt: { xs: 3, sm: 4 } }}>
            <AnimatePresence mode="wait">
              {error ? (
                <Paper
                  key="error"
                  component={motion.div}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  variant="outlined"
                  sx={{ borderColor: "error.light", bgcolor: "error.50", px: 2, py: 2, textAlign: "center" }}
                >
                  <Typography variant="body2" color="error.main">
                    {error}
                  </Typography>
                </Paper>
              ) : null}

              {loading ? (
                <Paper
                  key="loading"
                  component={motion.div}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  variant="outlined"
                  sx={{ minHeight: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 4 }}
                >
                  <Inventory2OutlinedIcon sx={{ mb: 1.5, fontSize: 36, color: "primary.main", animation: "pulse 1.5s ease-in-out infinite" }} />
                  <Typography variant="body2" fontWeight={500} color="text.secondary">
                    Searching for orders...
                  </Typography>
                </Paper>
              ) : orders.length > 0 ? (
                <Stack
                  key="orders"
                  component={motion.div}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  spacing={2.5}
                >
                  {orders.map((order, index) => (
                    <OrderTrackingCard key={order._id} order={order} index={index} />
                  ))}
                </Stack>
              ) : hasSearched && !error ? (
                <Paper
                  key="empty"
                  component={motion.div}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  variant="outlined"
                  sx={{ borderStyle: "dashed", px: 3, py: 7, textAlign: "center" }}
                >
                  <Inventory2OutlinedIcon sx={{ fontSize: 40, color: "grey.300" }} />
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 2 }}>
                    No orders found
                  </Typography>
                </Paper>
              ) : (
                <Grid
                  key="hint"
                  component={motion.div}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  container
                  spacing={1.5}
                >
                  {hintCards.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Grid key={item.title} size={{ xs: 12, sm: 4 }}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Box sx={{ mb: 1.5, display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 1, bgcolor: "primary.50", color: "primary.main" }}>
                            <Icon fontSize="small" />
                          </Box>
                          <Typography variant="body2" fontWeight={700}>
                            {item.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block", lineHeight: 1.5 }}>
                            {item.desc}
                          </Typography>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </AnimatePresence>
          </Box>
        </StoreContainer>
      </Box>
    </StoreShell>
  );
}
