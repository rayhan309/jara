"use client";

import {
  ArrowRight,
  ClipboardList,
  Download,
  PackagePlus,
  Warehouse,
} from "lucide-react";
import { motion } from "motion/react";
import {
  HiOutlineClipboardDocumentList,
  HiOutlineShoppingCart,
  HiOutlineUserPlus,
} from "react-icons/hi2";
import { TbCreditCard } from "react-icons/tb";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import RevenueChart from "@/components/dashboard/RevenueChart";
import { MotionFadeIn, MotionHoverCard } from "@/components/dashboard/MotionFade";

const recentOrders = [
  { id: "#NX-1042", customer: "Rahim Ahmed", total: "৳3,450", status: "Delivered", time: "2m ago" },
  { id: "#NX-1041", customer: "Sadia Khan", total: "৳1,890", status: "Processing", time: "18m ago" },
  { id: "#NX-1040", customer: "Karim Hossain", total: "৳5,200", status: "Shipped", time: "1h ago" },
  { id: "#NX-1039", customer: "Nusrat Jahan", total: "৳920", status: "Pending", time: "2h ago" },
  { id: "#NX-1038", customer: "Tanvir Islam", total: "৳2,100", status: "Delivered", time: "3h ago" },
];

const activities = [
  { text: "New order #NX-1042 placed", time: "2 min ago", icon: HiOutlineShoppingCart },
  { text: "Product stock updated — Wireless Earbuds", time: "45 min ago", icon: Warehouse },
  { text: "Payment confirmed for #NX-1040", time: "1 hr ago", icon: TbCreditCard },
  { text: "New customer registered", time: "2 hrs ago", icon: HiOutlineUserPlus },
];

const quickActions = [
  { label: "Add Product", desc: "Create new listing", icon: PackagePlus, accent: "bg-indigo-500" },
  { label: "View Orders", desc: "Manage all orders", icon: ClipboardList, accent: "bg-violet-500" },
  { label: "Inventory", desc: "Stock levels", icon: Warehouse, accent: "bg-emerald-500" },
  { label: "Export Report", desc: "Download CSV", icon: Download, accent: "bg-amber-500" },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-8">
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value="৳2.4M"
          change="+12.5%"
          subtitle="vs last month"
          accent="indigo"
          delay={0}
          showCurrencyIcon
        />
        <StatCard
          title="Total Orders"
          value="1,284"
          change="+8.2%"
          subtitle="142 pending"
          accent="emerald"
          delay={80}
        />
        <StatCard
          title="Products"
          value="342"
          change="+3"
          subtitle="12 low stock"
          accent="amber"
          delay={160}
        />
        <StatCard
          title="Customers"
          value="896"
          change="+24"
          subtitle="68 new this week"
          accent="rose"
          delay={240}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <MotionFadeIn delay={320} className="xl:col-span-2">
          <MotionHoverCard>
            <div className="dash-card p-6">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-dash-text">Revenue Overview</h2>
                  <p className="mt-1 text-sm text-dash-muted">Monthly performance trend</p>
                </div>
                <span className="border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                  +18.4% YTD
                </span>
              </div>
              <RevenueChart />
            </div>
          </MotionHoverCard>
        </MotionFadeIn>

        <MotionFadeIn delay={400}>
          <div className="dash-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <HiOutlineClipboardDocumentList className="h-5 w-5 text-indigo-600" />
              <div>
                <h2 className="text-lg font-bold text-dash-text">Live Activity</h2>
                <p className="text-sm text-dash-muted">Recent store events</p>
              </div>
            </div>
            <div className="space-y-4">
              {activities.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.08 }}
                    className="flex gap-3"
                  >
                    <div className="relative flex flex-col items-center">
                      <span className="flex h-8 w-8 items-center justify-center border border-indigo-200 bg-indigo-50 text-indigo-600">
                        <Icon className="h-4 w-4" />
                      </span>
                      {index < activities.length - 1 ? (
                        <span className="mt-1 w-px flex-1 bg-dash-border" />
                      ) : null}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-dash-text">{item.text}</p>
                      <p className="mt-0.5 text-xs text-dash-muted">{item.time}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </MotionFadeIn>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <MotionFadeIn delay={480} className="lg:col-span-2">
          <MotionHoverCard>
            <div className="dash-card p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-dash-text">Recent Orders</h2>
                  <p className="mt-1 text-sm text-dash-muted">Latest transactions</p>
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="border border-dash-border px-3 py-1.5 text-xs font-semibold tracking-wide text-dash-muted uppercase transition-colors hover:border-indigo-300 hover:text-indigo-600"
                >
                  View All
                </motion.button>
              </div>

              <div className="overflow-x-auto">
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
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.55 + index * 0.05 }}
                        className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/80"
                      >
                        <td className="py-3.5 pr-4 font-semibold text-indigo-600">{order.id}</td>
                        <td className="py-3.5 pr-4 text-dash-text">{order.customer}</td>
                        <td className="py-3.5 pr-4 font-semibold text-dash-text">{order.total}</td>
                        <td className="py-3.5 pr-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="py-3.5 text-xs text-dash-muted">{order.time}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </MotionHoverCard>
        </MotionFadeIn>

        <MotionFadeIn delay={560}>
          <div className="dash-card p-6">
            <h2 className="text-lg font-bold text-dash-text">Quick Actions</h2>
            <p className="mt-1 mb-5 text-sm text-dash-muted">Common admin tasks</p>
            <div className="space-y-2">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.label}
                    type="button"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.07 }}
                    whileHover={{ x: 4 }}
                    className="group flex w-full items-center gap-3 border border-dash-border p-3 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50/50"
                  >
                    <span className={`flex h-10 w-10 items-center justify-center text-white ${action.accent}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-dash-text group-hover:text-indigo-700">
                        {action.label}
                      </span>
                      <span className="text-xs text-dash-muted">{action.desc}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-dash-muted group-hover:text-indigo-600" />
                  </motion.button>
                );
              })}
            </div>
          </div>
        </MotionFadeIn>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Conversion Rate", value: "3.8%", hint: "Above industry avg" },
          { label: "Avg. Order Value", value: "৳1,870", hint: "+৳120 vs last week" },
          { label: "Return Rate", value: "1.2%", hint: "Low — excellent" },
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
