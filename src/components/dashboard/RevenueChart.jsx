"use client";

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
    <div className="rounded-md border border-dash-border bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-dash-text">{label}</p>
      <p className="text-sm font-bold text-indigo-600">৳{Number(revenue).toLocaleString()}</p>
      <p className="text-xs text-dash-muted">{orderCount} orders</p>
    </div>
  );
}

export default function RevenueChart({ data = [] }) {
  const chartData = data.length
    ? data
    : [{ month: "—", revenue: 0, orders: 0 }];

  const maxRevenue = Math.max(...chartData.map((entry) => entry.revenue), 1);

  return (
    <div className="h-44 w-full pt-2 sm:h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barSize={32}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickFormatter={(value) =>
              value >= 1000 ? `${Math.round(value / 1000)}k` : value
            }
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(99, 102, 241, 0.06)" }} />
          <Bar dataKey="revenue" radius={[0, 0, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`${entry.month}-${index}`}
                fill={entry.revenue === maxRevenue && entry.revenue > 0 ? "#4f46e5" : "#a5b4fc"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatSparkline({ data, color = "#6366f1" }) {
  return (
    <div className="mt-4 h-12 w-full">
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
    </div>
  );
}

export function OrdersAreaChart() {
  return (
    <div className="h-32 w-full">
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
    </div>
  );
}
