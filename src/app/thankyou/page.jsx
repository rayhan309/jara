"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import StoreContainer from "@/components/container/StoreContainer";
import StoreShell from "@/components/layout/StoreShell";
import { formatDisplayOrderNumber } from "@/lib/orderHelpers";
import { trackMetaEvent } from "@/lib/metaPixel";

export default function ThankYou() {
  const [orderInfo, setOrderInfo] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("nexa_last_order");
      if (!raw) return;

      const parsed = JSON.parse(raw);
      setOrderInfo(parsed);
      sessionStorage.removeItem("nexa_last_order");

      const items = parsed.items || [];
      trackMetaEvent("Purchase", {
        value: Number(parsed.total || 0),
        currency: parsed.currency || "BDT",
        content_ids: items.map((item) => String(item.id)),
        content_type: "product",
        contents: items.map((item) => ({
          id: String(item.id),
          quantity: item.quantity,
          item_price: item.price,
        })),
        num_items: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
        order_id: formatDisplayOrderNumber(parsed.order_number),
      });
    } catch {
      setOrderInfo(null);
    }
  }, []);

  const displayOrderNumber = orderInfo?.order_number
    ? formatDisplayOrderNumber(orderInfo.order_number)
    : null;

  async function handleCopyOrderId() {
    if (!displayOrderNumber) return;

    try {
      await navigator.clipboard.writeText(displayOrderNumber);
      setCopied(true);
      toast.success("Order number copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy");
    }
  }

  const trackHref = orderInfo?.phone
    ? `/orders-traking?phone=${encodeURIComponent(orderInfo.phone)}`
    : "/orders-traking";

  return (
    <StoreShell sx={{ bgcolor: "grey.50" }}>
      <StoreContainer className="py-12 sm:py-16 lg:py-24">
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{ mx: "auto", maxWidth: 480, textAlign: "center" }}
        >
          <Box
            component={motion.div}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 220, delay: 0.15 }}
            sx={{
              mx: "auto",
              mb: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 80,
              height: 80,
              borderRadius: 1,
              border: 1,
              borderColor: "success.light",
              bgcolor: "success.50",
            }}
          >
            <CheckCircleOutlineRoundedIcon sx={{ fontSize: 40, color: "success.main" }} />
          </Box>

          <Typography variant="caption" fontWeight={600} color="success.main" sx={{ letterSpacing: "0.12em" }}>
            Order confirmed
          </Typography>
          <Typography variant="h3" fontWeight={700} sx={{ mt: 1.5 }}>
            Thank you for your order!
          </Typography>

          {displayOrderNumber ? (
            <Paper variant="outlined" sx={{ mt: 2, px: 2, py: 1.5, textAlign: "center" }}>
              <Typography variant="caption" fontWeight={600} color="text.disabled">
                Order number
              </Typography>
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mt: 0.5 }}>
                <Typography fontWeight={700} color="primary.main">
                  {displayOrderNumber}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 16 }} />}
                  onClick={handleCopyOrderId}
                  aria-label="Copy order number"
                >
                  {copied ? "Copied" : "Copy"}
                </Button>
              </Stack>
              {orderInfo.total ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Total:{" "}
                  <Typography component="span" fontWeight={600} color="text.primary">
                    ৳{Number(orderInfo.total).toLocaleString()}
                  </Typography>
                </Typography>
              ) : null}
            </Paper>
          ) : null}

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, lineHeight: 1.7 }}>
            We've received your order and will contact you shortly. You can track delivery anytime.
          </Typography>

          <Stack
            component={motion.div}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            justifyContent="center"
            sx={{ mt: 4 }}
          >
            <Button
              component={Link}
              href={trackHref}
              variant="contained"
              startIcon={<Inventory2OutlinedIcon />}
              sx={{ width: { xs: 1, sm: "auto" } }}
            >
              Track order
            </Button>
            <Button component={Link} href="/" variant="outlined" sx={{ width: { xs: 1, sm: "auto" } }}>
              Continue shopping
            </Button>
          </Stack>
        </Box>
      </StoreContainer>
    </StoreShell>
  );
}
