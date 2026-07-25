"use client";

import Chip from "@mui/material/Chip";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ReportGmailerrorredOutlinedIcon from "@mui/icons-material/ReportGmailerrorredOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import {
  getOrderStatusLabel,
  normalizeOrderStatus,
} from "@/lib/orderHelpers";

const styles = {
  new: { color: "default", icon: Inventory2OutlinedIcon },
  confirmed: { color: "info", icon: ScheduleRoundedIcon },
  steadfast_entered: { color: "primary", icon: LocalShippingOutlinedIcon },
  no_response: { color: "warning", icon: WarningAmberRoundedIcon },
  will_inform_later: { color: "warning", icon: ScheduleRoundedIcon },
  color_code_pending: { color: "secondary", icon: PaletteOutlinedIcon },
  out_for_delivery: { color: "success", icon: CheckCircleOutlineRoundedIcon },
  scammer: { color: "error", icon: ReportGmailerrorredOutlinedIcon },
  // Legacy / generic
  Delivered: { color: "success", icon: CheckCircleOutlineRoundedIcon },
  Processing: { color: "warning", icon: ScheduleRoundedIcon },
  Shipped: { color: "primary", icon: LocalShippingOutlinedIcon },
  Pending: { color: "default", icon: Inventory2OutlinedIcon },
  Cancelled: { color: "error", icon: CancelOutlinedIcon },
};

export default function StatusBadge({ status, label }) {
  const normalized = normalizeOrderStatus(status);
  const config = styles[normalized] || styles[status] || styles.new || styles.Pending;
  const Icon = config.icon;
  const displayLabel = label || getOrderStatusLabel(status) || status;

  return (
    <Chip
      size="small"
      color={config.color}
      variant="outlined"
      icon={<Icon sx={{ fontSize: "14px !important" }} />}
      label={displayLabel}
      sx={{ fontWeight: 700, fontSize: 11, letterSpacing: "0.02em" }}
    />
  );
}
