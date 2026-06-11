"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Layers,
  Loader2,
  PackagePlus,
  Warehouse,
} from "lucide-react";
import {
  HiOutlineCurrencyBangladeshi,
  HiOutlineCube,
  HiOutlineShoppingCart,
  HiOutlineUsers,
} from "react-icons/hi2";
import StatCard from "@/components/dashboard/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import { MotionFadeIn } from "@/components/dashboard/MotionFade";
import {
  DesktopTable,
  MobileCardList,
  MobileDashCard,
  MobileDashRow,
} from "@/components/shared/ResponsiveTable";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { useProducts } from "@/hooks/useProducts";
import {
  buildDashboardStats,
  buildMonthlyChartData,
  buildRecentActivities,
  formatCurrency,
  formatRelativeTime,
} from "@/lib/dashboardStats";
import {
  formatDisplayOrderNumber,
  getOrderStatusClass,
  getOrderStatusLabel,
} from "@/lib/orderHelpers";

const quickActions = [
  {
    label: "Add Product",
    desc: "Create a new listing",
    href: "/dashboard/products",
    icon: PackagePlus,
  },
  {
    label: "View Orders",
    desc: "Manage fulfillment",
    href: "/dashboard/orders",
    icon: ClipboardList,
  },
  {
    label: "Categories",
    desc: "Organize catalog",
    href: "/dashboard/categories",
    icon: Layers,
  },
];

function OrderStatusPill({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${getOrderStatusClass(status)}`}
    >
      {getOrderStatusLabel(status)}
    </span>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-sm font-bold text-dash-text sm:text-base">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export default function DashboardOverview() {
  const { data: orders = [], isLoading: ordersLoading } = useAdminOrders();
  const { data: products = [], isLoading: productsLoading } = useProducts();

  const isLoading = ordersLoading || productsLoading;

  const stats = useMemo(() => buildDashboardStats(orders, products), [orders, products]);
  const chartData = useMemo(() => buildMonthlyChartData(orders), [orders]);
  const activities = useMemo(() => buildRecentActivities(orders, products), [orders, products]);
  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  if (isLoading) {
    return (
      <div className="dash-card flex min-h-[360px] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <MotionFadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.14em] text-indigo-600 uppercase">
              Overview
            </p>
            <h1 className="text-xl font-bold text-dash-text sm:text-2xl">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">
              Store performance from orders and products.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
              {stats.totalOrders} orders
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              {formatCurrency(stats.totalRevenue)} revenue
            </span>
          </div>
        </div>
      </MotionFadeIn>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          subtitle={`${stats.deliveredOrders} delivered`}
          accent="indigo"
          delay={0}
          icon={HiOutlineCurrencyBangladeshi}
        />
        <StatCard
          title="Total Orders"
          value={String(stats.totalOrders)}
          subtitle={`${stats.pendingOrders} pending`}
          accent="emerald"
          delay={40}
          icon={HiOutlineShoppingCart}
        />
        <StatCard
          title="Products"
          value={String(stats.totalProducts)}
          subtitle={`${stats.lowStockProducts} low stock`}
          accent="amber"
          delay={80}
          icon={HiOutlineCube}
        />
        <StatCard
          title="Customers"
          value={String(stats.uniqueCustomers)}
          subtitle="Unique phone numbers"
          accent="rose"
          delay={120}
          icon={HiOutlineUsers}
        />
      </section>

      <section className="grid items-start gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <MotionFadeIn delay={160}>
            <div className="dash-card p-4 sm:p-5">
              <SectionHeader
                title="Revenue Overview"
                subtitle="Last 6 months · COD orders"
                action={
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                    {stats.totalOrders} total
                  </span>
                }
              />
              <RevenueChart data={chartData} />
            </div>
          </MotionFadeIn>

          <MotionFadeIn delay={240}>
          <div className="dash-card overflow-hidden">
            <div className="border-b border-dash-border px-4 py-4 sm:px-5">
              <SectionHeader
                title="Recent Orders"
                subtitle="Latest transactions"
                action={
                  <Link
                    href="/dashboard/orders"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
                  >
                    View all
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                }
              />
            </div>

            {recentOrders.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-slate-500 sm:px-5">
                No orders yet. They will appear here after checkout.
              </p>
            ) : (
              <>
                <MobileCardList className="space-y-0 divide-y divide-dash-border p-0 lg:hidden">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="p-3.5">
                      <MobileDashCard className="border-0 p-0 shadow-none">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-bold tabular-nums text-indigo-600">
                            #{formatDisplayOrderNumber(order.order_number)}
                          </p>
                          <OrderStatusPill status={order.status} />
                        </div>
                        <div className="mt-2.5 space-y-1.5">
                          <MobileDashRow label="Customer" value={order.customer?.name || "—"} />
                          <MobileDashRow label="Amount" value={formatCurrency(order.pricing?.total)} />
                          <MobileDashRow label="Time" value={formatRelativeTime(order.createdAt)} />
                        </div>
                      </MobileDashCard>
                    </div>
                  ))}
                </MobileCardList>

                <DesktopTable>
                  <table className="min-w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-dash-border bg-slate-50/90">
                        <th className="px-5 py-2.5 text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                          Order
                        </th>
                        <th className="px-4 py-2.5 text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                          Customer
                        </th>
                        <th className="px-4 py-2.5 text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                          Amount
                        </th>
                        <th className="px-4 py-2.5 text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                          Status
                        </th>
                        <th className="px-5 py-2.5 text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentOrders.map((order) => (
                        <tr
                          key={order._id}
                          className="transition-colors hover:bg-slate-50/70"
                        >
                          <td className="px-5 py-2.5 text-[13px] font-semibold tabular-nums text-indigo-600">
                            #{formatDisplayOrderNumber(order.order_number)}
                          </td>
                          <td className="px-4 py-2.5 text-[13px] text-dash-text">
                            {order.customer?.name || "—"}
                          </td>
                          <td className="px-4 py-2.5 text-[13px] font-semibold tabular-nums text-dash-text">
                            {formatCurrency(order.pricing?.total)}
                          </td>
                          <td className="px-4 py-2.5">
                            <OrderStatusPill status={order.status} />
                          </td>
                          <td className="px-5 py-2.5 text-[11px] text-slate-400">
                            {formatRelativeTime(order.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </DesktopTable>
              </>
            )}
          </div>
          </MotionFadeIn>
        </div>

        <div className="space-y-4">
          <MotionFadeIn delay={200}>
            <div className="dash-card p-4 sm:p-5">
              <SectionHeader
                title="Recent Activity"
                subtitle="Latest store events"
              />
              {activities.length === 0 ? (
                <p className="text-sm text-slate-500">No recent activity yet.</p>
              ) : (
                <div className="space-y-3">
                  {activities.map((item) => {
                    const Icon = item.icon === "stock" ? Warehouse : HiOutlineShoppingCart;

                    return (
                      <div
                        key={item.id}
                        className="flex gap-2.5 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-indigo-600 shadow-sm">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium leading-snug text-dash-text">
                            {item.text}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {formatRelativeTime(item.time)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </MotionFadeIn>

          <MotionFadeIn delay={280}>
            <div className="dash-card p-4 sm:p-5">
              <SectionHeader title="Quick Actions" subtitle="Common admin tasks" />
              <div className="space-y-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="group flex items-center gap-3 rounded-lg border border-slate-200/80 bg-white px-3 py-2.5 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 transition-colors group-hover:bg-indigo-100 group-hover:text-indigo-600">
                        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-semibold text-dash-text group-hover:text-indigo-700">
                          {action.label}
                        </span>
                        <span className="text-[11px] text-slate-500">{action.desc}</span>
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-colors group-hover:text-indigo-500" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </MotionFadeIn>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Pending Orders",
            value: String(stats.pendingOrders),
            hint: "Awaiting processing",
            valueClass: "text-amber-600",
            cardClass: "bg-amber-50/60 border-amber-100",
          },
          {
            label: "Avg. Order Value",
            value: formatCurrency(stats.avgOrderValue),
            hint: "Excludes cancelled",
            valueClass: "text-indigo-600",
            cardClass: "bg-indigo-50/60 border-indigo-100",
          },
          {
            label: "Out of Stock",
            value: String(stats.outOfStock),
            hint: "Unavailable products",
            valueClass: "text-rose-600",
            cardClass: "bg-rose-50/60 border-rose-100",
          },
        ].map((metric, index) => (
          <MotionFadeIn key={metric.label} delay={320 + index * 40}>
            <div className={`dash-card border px-4 py-3.5 ${metric.cardClass}`}>
              <p className="text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                {metric.label}
              </p>
              <p className={`mt-1 text-lg font-bold tabular-nums ${metric.valueClass}`}>
                {metric.value}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">{metric.hint}</p>
            </div>
          </MotionFadeIn>
        ))}
      </section>
    </div>
  );
}
