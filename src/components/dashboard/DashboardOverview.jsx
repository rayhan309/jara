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
import { motion } from "motion/react";
import {
  HiOutlineClipboardDocumentList,
  HiOutlineShoppingCart,
} from "react-icons/hi2";
import StatCard from "@/components/dashboard/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import { MotionFadeIn, MotionHoverCard } from "@/components/dashboard/MotionFade";
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
import { getOrderStatusClass, getOrderStatusLabel } from "@/lib/orderHelpers";

const quickActions = [
  {
    label: "Add Product",
    desc: "Create new listing",
    href: "/dashboard/products",
    icon: PackagePlus,
    accent: "bg-indigo-500",
  },
  {
    label: "View Orders",
    desc: "Manage all orders",
    href: "/dashboard/orders",
    icon: ClipboardList,
    accent: "bg-violet-500",
  },
  {
    label: "Products",
    desc: "Catalog & inventory",
    href: "/dashboard/products",
    icon: Warehouse,
    accent: "bg-emerald-500",
  },
  {
    label: "Categories",
    desc: "Manage categories",
    href: "/dashboard/categories",
    icon: Layers,
    accent: "bg-amber-500",
  },
];

function OrderStatusPill({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase ${getOrderStatusClass(status)}`}
    >
      {getOrderStatusLabel(status)}
    </span>
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
      <div className="dash-card flex min-h-[420px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <MotionFadeIn>
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-indigo-600 uppercase">
            Overview
          </p>
          <h1 className="text-2xl font-bold text-dash-text">Dashboard</h1>
          <p className="mt-1 text-sm text-dash-muted">
            Live store performance from your orders and products.
          </p>
        </div>
      </MotionFadeIn>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          subtitle={`${stats.deliveredOrders} delivered orders`}
          accent="indigo"
          delay={0}
          showCurrencyIcon
        />
        <StatCard
          title="Total Orders"
          value={String(stats.totalOrders)}
          subtitle={`${stats.pendingOrders} pending`}
          accent="emerald"
          delay={80}
        />
        <StatCard
          title="Products"
          value={String(stats.totalProducts)}
          subtitle={`${stats.lowStockProducts} low stock`}
          accent="amber"
          delay={160}
        />
        <StatCard
          title="Customers"
          value={String(stats.uniqueCustomers)}
          subtitle="Unique phone numbers"
          accent="rose"
          delay={240}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <MotionFadeIn delay={320} className="xl:col-span-2">
          <MotionHoverCard>
            <div className="dash-card p-4 sm:p-6">
              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-dash-text">Revenue Overview</h2>
                  <p className="mt-1 text-sm text-dash-muted">Last 6 months (COD orders)</p>
                </div>
                <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                  {stats.totalOrders} orders
                </span>
              </div>
              <RevenueChart data={chartData} />
            </div>
          </MotionHoverCard>
        </MotionFadeIn>

        <MotionFadeIn delay={400}>
          <div className="dash-card p-4 sm:p-6">
            <div className="mb-5 flex items-center gap-2">
              <HiOutlineClipboardDocumentList className="h-5 w-5 text-indigo-600" />
              <div>
                <h2 className="text-lg font-bold text-dash-text">Live Activity</h2>
                <p className="text-sm text-dash-muted">Recent store events</p>
              </div>
            </div>
            {activities.length === 0 ? (
              <p className="text-sm text-dash-muted">No recent activity yet.</p>
            ) : (
              <div className="space-y-4">
                {activities.map((item, index) => {
                  const Icon =
                    item.icon === "stock" ? Warehouse : HiOutlineShoppingCart;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.08 }}
                      className="flex gap-3"
                    >
                      <div className="relative flex flex-col items-center">
                        <span className="rounded-md flex h-8 w-8 items-center justify-center border border-indigo-200 bg-indigo-50 text-indigo-600">
                          <Icon className="h-4 w-4" />
                        </span>
                        {index < activities.length - 1 ? (
                          <span className="mt-1 w-px flex-1 bg-dash-border" />
                        ) : null}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-medium text-dash-text">{item.text}</p>
                        <p className="mt-0.5 text-xs text-dash-muted">
                          {formatRelativeTime(item.time)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </MotionFadeIn>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <MotionFadeIn delay={480} className="lg:col-span-2">
          <MotionHoverCard>
            <div className="dash-card p-4 sm:p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-dash-text">Recent Orders</h2>
                  <p className="mt-1 text-sm text-dash-muted">Latest transactions</p>
                </div>
                <Link href="/dashboard/orders">
                  <motion.span
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="rounded-md inline-block border border-dash-border px-3 py-1.5 text-xs font-semibold tracking-wide text-dash-muted uppercase transition-colors hover:border-indigo-300 hover:text-indigo-600"
                  >
                    View All
                  </motion.span>
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <p className="py-8 text-center text-sm text-dash-muted">
                  No orders yet. They will appear here after checkout.
                </p>
              ) : (
                <>
                  <MobileCardList>
                    {recentOrders.map((order, index) => (
                      <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 + index * 0.05 }}
                      >
                        <MobileDashCard>
                          <div className="flex items-start justify-between gap-2">
                            <p className="break-all text-sm font-bold text-indigo-600">
                              {order.order_number}
                            </p>
                            <OrderStatusPill status={order.status} />
                          </div>
                          <div className="mt-3 space-y-2">
                            <MobileDashRow label="Customer" value={order.customer?.name || "—"} />
                            <MobileDashRow label="Amount" value={formatCurrency(order.pricing?.total)} />
                            <MobileDashRow label="Time" value={formatRelativeTime(order.createdAt)} />
                          </div>
                        </MobileDashCard>
                      </motion.div>
                    ))}
                  </MobileCardList>

                  <DesktopTable>
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-dash-border text-[11px] tracking-widest text-dash-muted uppercase">
                          <th className="pb-3 pr-4 font-semibold">Order ID</th>
                          <th className="pb-3 pr-4 font-semibold">Customer</th>
                          <th className="pb-3 pr-4 font-semibold">Amount</th>
                          <th className="pb-3 pr-4 font-semibold">Status</th>
                          <th className="pb-3 font-semibold">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order, index) => (
                          <motion.tr
                            key={order._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.55 + index * 0.05 }}
                            className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/80"
                          >
                            <td className="py-3.5 pr-4 font-semibold text-indigo-600">
                              {order.order_number}
                            </td>
                            <td className="py-3.5 pr-4 text-dash-text">
                              {order.customer?.name || "—"}
                            </td>
                            <td className="py-3.5 pr-4 font-semibold text-dash-text">
                              {formatCurrency(order.pricing?.total)}
                            </td>
                            <td className="py-3.5 pr-4">
                              <OrderStatusPill status={order.status} />
                            </td>
                            <td className="py-3.5 text-xs text-dash-muted">
                              {formatRelativeTime(order.createdAt)}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </DesktopTable>
                </>
              )}
            </div>
          </MotionHoverCard>
        </MotionFadeIn>

        <MotionFadeIn delay={560}>
          <div className="dash-card p-4 sm:p-6">
            <h2 className="text-lg font-bold text-dash-text">Quick Actions</h2>
            <p className="mt-1 mb-5 text-sm text-dash-muted">Common admin tasks</p>
            <div className="space-y-2">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link key={action.label} href={action.href}>
                    <motion.span
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.07 }}
                      whileHover={{ x: 4 }}
                      className="rounded-md group flex w-full items-center gap-3 border border-dash-border p-3 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50/50"
                    >
                      <span
                        className={`flex h-10 w-10 items-center justify-center text-white ${action.accent}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-semibold text-dash-text group-hover:text-indigo-700">
                          {action.label}
                        </span>
                        <span className="text-xs text-dash-muted">{action.desc}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-dash-muted group-hover:text-indigo-600" />
                    </motion.span>
                  </Link>
                );
              })}
            </div>
          </div>
        </MotionFadeIn>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Pending Orders",
            value: String(stats.pendingOrders),
            hint: "Awaiting processing",
          },
          {
            label: "Avg. Order Value",
            value: formatCurrency(stats.avgOrderValue),
            hint: "Excludes cancelled",
          },
          {
            label: "Out of Stock",
            value: String(stats.outOfStock),
            hint: "Products unavailable",
          },
        ].map((metric, index) => (
          <MotionFadeIn key={metric.label} delay={640 + index * 60}>
            <MotionHoverCard>
              <div className="dash-card border-dashed p-5 text-center">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-dash-muted uppercase">
                  {metric.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-dash-text">{metric.value}</p>
                <p className="mt-1 text-xs text-emerald-600">{metric.hint}</p>
              </div>
            </MotionHoverCard>
          </MotionFadeIn>
        ))}
      </section>
    </div>
  );
}
