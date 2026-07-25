"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const revenueData = [
  { month: "Jan", revenue: 42, orders: 120 },
  { month: "Feb", revenue: 58, orders: 145 },
  { month: "Mar", revenue: 45, orders: 132 },
  { month: "Apr", revenue: 72, orders: 178 },
  { month: "May", revenue: 65, orders: 165 },
  { month: "Jun", revenue: 88, orders: 210 },
  { month: "Jul", revenue: 76, orders: 192 },
];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const revenue = payload.find((entry) => entry.dataKey === "revenue")?.value ?? 0;
  const orderCount = payload.find((entry) => entry.dataKey === "orders")?.value ?? 0;

  return (
    <Paper
      elevation={3}
      sx={{
        px: 1.5,
        py: 1,
        border: 1,
        borderColor: "divider",
      }}
    >
      <Typography variant="caption" fontWeight={700} display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={800} color="primary.main">
        ৳{Number(revenue).toLocaleString()}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {orderCount} orders
      </Typography>
    </Paper>
  );
}

export default function RevenueChart({ data = [] }) {
  const chartData = data.length
    ? data
    : [{ month: "—", revenue: 0, orders: 0 }];

  const maxRevenue = Math.max(...chartData.map((entry) => entry.revenue), 1);

  return (
    <Box
      sx={{
        height: { xs: 160, sm: 208, lg: 224 },
        width: 1,
        minWidth: 0,
        pt: 1,
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barSize={20} barCategoryGap="18%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={36}
            tick={{ fill: "#64748b", fontSize: 10 }}
            tickFormatter={(value) =>
              value >= 1000 ? `${Math.round(value / 1000)}k` : value
            }
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(99, 102, 241, 0.06)" }} />
          <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`${entry.month}-${index}`}
                fill={entry.revenue === maxRevenue && entry.revenue > 0 ? "#4f46e5" : "#c7d2fe"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

export function StatSparkline({ data, color = "#6366f1" }) {
  return (
    <Box sx={{ mt: 2, height: 48, width: 1 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${color})`}
            dot={false}
            isAnimationActive
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}

export function OrdersAreaChart() {
  return (
    <Box sx={{ height: 128, width: 1 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={revenueData}>
          <defs>
            <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="orders"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#ordersGrad)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
