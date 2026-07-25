"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import RevenueChart from "@/components/dashboard/RevenueChart";
import DashPageHeader from "@/components/dashboard/DashPageHeader";
import { MotionFadeIn } from "@/components/dashboard/MotionFade";
import { useDashboardSummary } from "@/hooks/useDashboard";
import { formatCurrency, formatRelativeTime } from "@/lib/dashboardStats";
import {
  formatDisplayOrderNumber,
  getOrderStatusLabel,
} from "@/lib/orderHelpers";

const quickActions = [
  {
    label: "Add Product",
    desc: "Create a new listing",
    href: "/dashboard/products/new",
    icon: AddBoxOutlinedIcon,
  },
  {
    label: "View Orders",
    desc: "Manage fulfillment",
    href: "/dashboard/orders",
    icon: ListAltOutlinedIcon,
  },
  {
    label: "Categories",
    desc: "Organize catalog",
    href: "/dashboard/categories",
    icon: CategoryOutlinedIcon,
  },
];

function SectionHeader({ title, subtitle, action }) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        mb: 2,
        flexWrap: "wrap",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 1.5,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle2" fontWeight={800} sx={{ letterSpacing: "-0.01em" }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: "block" }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {action}
    </Stack>
  );
}

export default function DashboardOverview() {
  const { data, isLoading } = useDashboardSummary();

  const stats = data?.stats || {
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStock: 0,
    uniqueCustomers: 0,
    avgOrderValue: 0,
  };
  const chartData = data?.chartData || [];
  const activities = data?.activities || [];
  const recentOrders = data?.recentOrders || [];

  if (isLoading) {
    return (
      <Paper
        elevation={0}
        sx={{
          minHeight: 360,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: 1,
          borderColor: "divider",
        }}
      >
        <CircularProgress size={28} />
      </Paper>
    );
  }

  return (
    <Stack spacing={{ xs: 2.5, sm: 3 }}>
      <DashPageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Store performance from orders and products."
        action={
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            <Chip
              size="small"
              variant="outlined"
              label={`${stats.totalOrders} orders`}
              sx={{ fontWeight: 600, bgcolor: "background.paper" }}
            />
            <Chip
              size="small"
              color="success"
              variant="outlined"
              label={`${formatCurrency(stats.totalRevenue)} revenue`}
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            subtitle={`${stats.deliveredOrders} delivered`}
            accent="indigo"
            delay={0}
            icon={PaymentsOutlinedIcon}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <StatCard
            title="Total Orders"
            value={String(stats.totalOrders)}
            subtitle={`${stats.pendingOrders} pending`}
            accent="emerald"
            delay={40}
            icon={ShoppingCartOutlinedIcon}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <StatCard
            title="Products"
            value={String(stats.totalProducts)}
            subtitle={`${stats.lowStockProducts} low stock`}
            accent="amber"
            delay={80}
            icon={Inventory2OutlinedIcon}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <StatCard
            title="Customers"
            value={String(stats.uniqueCustomers)}
            subtitle="Unique phone numbers"
            accent="rose"
            delay={120}
            icon={PeopleOutlinedIcon}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>
        <Grid size={{ xs: 12, xl: 8 }}>
          <Stack spacing={2}>
            <MotionFadeIn delay={160}>
              <Paper
                elevation={0}
                sx={{ p: { xs: 2, sm: 2.5 }, border: 1, borderColor: "divider" }}
              >
                <SectionHeader
                  title="Revenue Overview"
                  subtitle="Last 6 months · COD orders"
                  action={
                    <Chip
                      size="small"
                      label={`${stats.totalOrders} total`}
                      sx={{ fontWeight: 700, fontSize: 11, bgcolor: "grey.100" }}
                    />
                  }
                />
                <RevenueChart data={chartData} />
              </Paper>
            </MotionFadeIn>

            <MotionFadeIn delay={240}>
              <Paper
                elevation={0}
                sx={{ overflow: "hidden", border: 1, borderColor: "divider" }}
              >
                <Box sx={{ borderBottom: 1, borderColor: "divider", px: { xs: 2, sm: 2.5 }, py: 2 }}>
                  <SectionHeader
                    title="Recent Orders"
                    subtitle="Latest transactions"
                    action={
                      <Button
                        component={Link}
                        href="/dashboard/orders"
                        size="small"
                        endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />}
                        sx={{ fontWeight: 700, textTransform: "none", fontSize: 12 }}
                      >
                        View all
                      </Button>
                    }
                  />
                </Box>

                {recentOrders.length === 0 ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ px: { xs: 2, sm: 2.5 }, py: 5, textAlign: "center" }}
                  >
                    No orders yet. They will appear here after checkout.
                  </Typography>
                ) : (
                  <>
                    <Stack
                      divider={<Box sx={{ borderBottom: 1, borderColor: "divider" }} />}
                      sx={{ display: { xs: "flex", lg: "none" } }}
                    >
                      {recentOrders.map((order) => (
                        <Box key={order._id} sx={{ p: 1.75 }}>
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
                          >
                            <Typography
                              variant="body2"
                              fontWeight={800}
                              color="primary.main"
                              sx={{ fontVariantNumeric: "tabular-nums" }}
                            >
                              #{formatDisplayOrderNumber(order.order_number)}
                            </Typography>
                            <StatusBadge status={getOrderStatusLabel(order.status)} />
                          </Stack>
                          <Stack spacing={1} sx={{ mt: 1.25 }}>
                            {[
                              { label: "Customer", value: order.customer?.name || "—" },
                              { label: "Amount", value: formatCurrency(order.pricing?.total) },
                              { label: "Time", value: formatRelativeTime(order.createdAt) },
                            ].map((row) => (
                              <Stack
                                key={row.label}
                                direction="row"
                                spacing={1.5}
                                sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
                              >
                                <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                                  {row.label}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  sx={{ minWidth: 0, textAlign: "right", wordBreak: "break-word" }}
                                >
                                  {row.value}
                                </Typography>
                              </Stack>
                            ))}
                          </Stack>
                        </Box>
                      ))}
                    </Stack>

                    <Box sx={{ display: { xs: "none", lg: "block" }, overflowX: "auto" }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: "grey.50" }}>
                            {["Order", "Customer", "Amount", "Status", "Time"].map((heading) => (
                              <TableCell
                                key={heading}
                                sx={{
                                  py: 1.25,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  letterSpacing: "0.08em",
                                  textTransform: "uppercase",
                                  color: "text.secondary",
                                }}
                              >
                                {heading}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {recentOrders.map((order) => (
                            <TableRow
                              key={order._id}
                              hover
                              sx={{ "&:last-child td": { borderBottom: 0 } }}
                            >
                              <TableCell
                                sx={{
                                  fontWeight: 700,
                                  color: "primary.main",
                                  fontVariantNumeric: "tabular-nums",
                                  fontSize: 13,
                                }}
                              >
                                #{formatDisplayOrderNumber(order.order_number)}
                              </TableCell>
                              <TableCell sx={{ fontSize: 13 }}>
                                {order.customer?.name || "—"}
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontWeight: 700,
                                  fontVariantNumeric: "tabular-nums",
                                  fontSize: 13,
                                }}
                              >
                                {formatCurrency(order.pricing?.total)}
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={getOrderStatusLabel(order.status)} />
                              </TableCell>
                              <TableCell sx={{ fontSize: 11, color: "text.secondary" }}>
                                {formatRelativeTime(order.createdAt)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  </>
                )}
              </Paper>
            </MotionFadeIn>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, xl: 4 }}>
          <Stack spacing={2}>
            <MotionFadeIn delay={200}>
              <Paper
                elevation={0}
                sx={{ p: { xs: 2, sm: 2.5 }, border: 1, borderColor: "divider" }}
              >
                <SectionHeader title="Recent Activity" subtitle="Latest store events" />
                {activities.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No recent activity yet.
                  </Typography>
                ) : (
                  <Stack spacing={1.25}>
                    {activities.map((item) => {
                      const Icon =
                        item.icon === "stock" ? WarehouseOutlinedIcon : ShoppingCartOutlinedIcon;

                      return (
                        <Stack
                          key={item.id}
                          direction="row"
                          spacing={1.25}
                          sx={{
                            px: 1.5,
                            py: 1.25,
                            border: 1,
                            borderColor: "divider",
                            borderRadius: 1,
                            bgcolor: "grey.50",
                          }}
                        >
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: "background.paper",
                              color: "primary.main",
                              boxShadow: 1,
                              flexShrink: 0,
                            }}
                          >
                            <Icon sx={{ fontSize: 14 }} />
                          </Box>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="caption" fontWeight={600} sx={{ lineHeight: 1.4, display: "block" }}>
                              {item.text}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, mt: 0.25, display: "block" }}>
                              {formatRelativeTime(item.time)}
                            </Typography>
                          </Box>
                        </Stack>
                      );
                    })}
                  </Stack>
                )}
              </Paper>
            </MotionFadeIn>

            <MotionFadeIn delay={280}>
              <Paper
                elevation={0}
                sx={{ p: { xs: 2, sm: 2.5 }, border: 1, borderColor: "divider" }}
              >
                <SectionHeader title="Quick Actions" subtitle="Common admin tasks" />
                <Stack spacing={1}>
                  {quickActions.map((action) => {
                    const Icon = action.icon;

                    return (
                      <Button
                        key={action.label}
                        component={Link}
                        href={action.href}
                        fullWidth
                        variant="outlined"
                        color="inherit"
                        sx={{
                          justifyContent: "flex-start",
                          textAlign: "left",
                          textTransform: "none",
                          px: 1.5,
                          py: 1.25,
                          borderColor: "divider",
                          color: "text.primary",
                          "&:hover": {
                            borderColor: "primary.light",
                            bgcolor: "primary.50",
                          },
                        }}
                        startIcon={
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: "grey.100",
                              color: "text.secondary",
                            }}
                          >
                            <Icon sx={{ fontSize: 16 }} />
                          </Box>
                        }
                        endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16, color: "grey.400" }} />}
                      >
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="body2" fontWeight={700} component="span" display="block">
                            {action.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" component="span" display="block">
                            {action.desc}
                          </Typography>
                        </Box>
                      </Button>
                    );
                  })}
                </Stack>
              </Paper>
            </MotionFadeIn>
          </Stack>
        </Grid>
      </Grid>

      <Grid container spacing={1.5}>
        {[
          {
            label: "Pending Orders",
            value: String(stats.pendingOrders),
            hint: "Awaiting processing",
            color: "warning.main",
            bgcolor: "warning.50",
            borderColor: "warning.light",
          },
          {
            label: "Avg. Order Value",
            value: formatCurrency(stats.avgOrderValue),
            hint: "Excludes cancelled",
            color: "primary.main",
            bgcolor: "primary.50",
            borderColor: "primary.light",
          },
          {
            label: "Out of Stock",
            value: String(stats.outOfStock),
            hint: "Unavailable products",
            color: "error.main",
            bgcolor: "error.50",
            borderColor: "error.light",
          },
        ].map((metric, index) => (
          <Grid key={metric.label} size={{ xs: 12, sm: 4 }}>
            <MotionFadeIn delay={320 + index * 40}>
              <Paper
                elevation={0}
                sx={{
                  px: 2,
                  py: 1.75,
                  border: 1,
                  borderColor: metric.borderColor,
                  bgcolor: metric.bgcolor,
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="text.secondary"
                  sx={{ letterSpacing: "0.08em", textTransform: "uppercase" }}
                >
                  {metric.label}
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={800}
                  sx={{ mt: 0.5, color: metric.color, fontVariantNumeric: "tabular-nums" }}
                >
                  {metric.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: "block" }}>
                  {metric.hint}
                </Typography>
              </Paper>
            </MotionFadeIn>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
