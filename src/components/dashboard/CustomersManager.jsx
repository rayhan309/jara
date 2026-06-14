"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  Eye,
  ExternalLink,
  Loader2,
  Repeat2,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { HiOutlineUsers } from "react-icons/hi2";
import { useAdminCustomers } from "@/hooks/useDashboard";
import { usePagination } from "@/hooks/usePagination";
import TablePagination from "@/components/dashboard/TablePagination";
import {
  DesktopTable,
  MobileCardList,
  MobileDashCard,
  MobileDashRow,
  mobileDashModalClass,
} from "@/components/shared/ResponsiveTable";
import {
  formatCustomerSpent,
} from "@/lib/customerHelpers";
import { formatRelativeTime } from "@/lib/dashboardStats";
import {
  formatDisplayOrderNumber,
  formatOrderDate,
  formatOrderTotal,
  getOrderStatusClass,
  getOrderStatusLabel,
} from "@/lib/orderHelpers";

const inputClass =
  "w-full rounded-md border border-dash-border bg-white px-3 py-2.5 text-sm text-dash-text outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="dash-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.1em] text-slate-500 uppercase">
            {label}
          </p>
          <p className="mt-2 text-xl font-bold tabular-nums tracking-tight text-dash-text sm:text-2xl">
            {value}
          </p>
          {hint ? <p className="mt-1 text-[11px] text-slate-500">{hint}</p> : null}
        </div>
        {Icon ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </span>
        ) : null}
      </div>
    </div>
  );
}

function CustomerAvatar({ name }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-xs font-bold text-white shadow-sm">
      {initial}
    </span>
  );
}

function OrderStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${getOrderStatusClass(status)}`}
    >
      {getOrderStatusLabel(status)}
    </span>
  );
}

function CustomerViewModal({ open, customer, onClose }) {
  if (!customer) return null;

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            className={`${mobileDashModalClass} sm:max-w-2xl`}
          >
            <div className="flex shrink-0 items-center gap-3 border-b border-dash-border px-5 py-4">
              <CustomerAvatar name={customer.name} />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-lg font-bold text-dash-text">{customer.name}</h2>
                <p className="text-sm text-slate-500">{customer.phone}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-dash-muted transition-colors hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
                  <p className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
                    Orders
                  </p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-dash-text">
                    {customer.orderCount}
                  </p>
                </div>
                <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-3">
                  <p className="text-[10px] font-semibold tracking-wide text-indigo-600 uppercase">
                    Total spent
                  </p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-indigo-700">
                    {formatCustomerSpent(customer.totalSpent)}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
                  <p className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
                    Last order
                  </p>
                  <p className="mt-1 text-sm font-semibold text-dash-text">
                    {formatRelativeTime(customer.lastOrderAt)}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-dash-border p-4">
                <p className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
                  Address
                </p>
                <p className="mt-2 text-sm leading-relaxed text-dash-text">{customer.address}</p>
                <Link
                  href={`/orders-traking?phone=${encodeURIComponent(customer.phone)}`}
                  target="_blank"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Track orders
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div>
                <p className="border-b border-dash-border pb-2 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
                  Order history
                </p>
                <div className="mt-3 space-y-2">
                  {customer.orders.map((order) => (
                    <div
                      key={order._id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200/80 bg-white p-3"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold tabular-nums text-indigo-600">
                          #{formatDisplayOrderNumber(order.order_number)}
                        </p>
                        <p className="text-xs text-slate-400">{formatOrderDate(order.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <OrderStatusBadge status={order.status} />
                        <span className="text-sm font-semibold tabular-nums text-dash-text">
                          {formatOrderTotal(order)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function CustomerRowActions({ customer, onView }) {
  return (
    <button
      type="button"
      aria-label="View customer"
      title="View"
      onClick={() => onView(customer)}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600"
    >
      <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
    </button>
  );
}

export default function CustomersManager() {
  const { data, isLoading, isError, error, refetch } = useAdminCustomers();
  const [search, setSearch] = useState("");
  const [viewCustomer, setViewCustomer] = useState(null);

  const customers = data?.customers ?? [];
  const stats = data?.stats ?? { totalCustomers: 0, repeatCustomers: 0, totalSpent: 0 };

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;

    return customers.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(term) ||
        customer.phone?.includes(term) ||
        customer.address?.toLowerCase().includes(term)
    );
  }, [customers, search]);

  const { page, setPage, totalPages, totalItems, pageSize, paginatedItems } =
    usePagination(filteredCustomers);

  return (
    <div className="space-y-5 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="text-[10px] font-semibold tracking-[0.14em] text-indigo-600 uppercase">
            CRM
          </p>
          <h1 className="text-xl font-bold text-dash-text sm:text-2xl">Customer Directory</h1>
          <p className="mt-1 text-sm text-slate-500">
            Customer profiles and purchase history from live orders.
          </p>
        </div>
        <span className="self-start rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 sm:self-auto">
          {customers.length} customers
        </span>
      </motion.div>

      {!isLoading && !isError && customers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Total customers" value={stats.totalCustomers} icon={HiOutlineUsers} />
          <StatCard
            label="Repeat customers"
            value={stats.repeatCustomers}
            hint="More than one order"
            icon={Repeat2}
          />
          <StatCard
            label="Lifetime value"
            value={formatCustomerSpent(stats.totalSpent)}
            icon={Wallet}
          />
        </div>
      ) : null}

      {customers.length > 0 ? (
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, phone, or address..."
          className={`${inputClass} w-full`}
        />
      ) : null}

      {isLoading ? (
        <div className="dash-card flex min-h-[280px] items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
        </div>
      ) : isError ? (
        <div className="dash-card border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-600">{error?.message || "Failed to load customers."}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 text-sm font-semibold text-indigo-600"
          >
            Try again
          </button>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="dash-card flex min-h-[280px] flex-col items-center justify-center p-10 text-center">
          <Users className="mb-4 h-10 w-10 text-indigo-600" />
          <h2 className="text-lg font-bold text-dash-text">
            {customers.length === 0 ? "No customers yet" : "No matching customers"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {customers.length === 0
              ? "Customers will appear here after their first order."
              : "Try a different search term."}
          </p>
        </div>
      ) : (
        <div className="dash-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-dash-border px-4 py-3 sm:px-5">
            <p className="text-xs text-slate-500">
              {filteredCustomers.length === customers.length
                ? `${customers.length} total customers`
                : `${filteredCustomers.length} of ${customers.length} customers`}
            </p>
            {stats.repeatCustomers > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                <TrendingUp className="h-3 w-3" />
                {stats.repeatCustomers} repeat
              </span>
            ) : null}
          </div>

          <MobileCardList className="space-y-0 divide-y divide-dash-border p-0 lg:hidden">
            {paginatedItems.map((customer) => (
              <div key={customer.id} className="p-3.5">
                <MobileDashCard className="border-0 p-0 shadow-none">
                  <div className="flex items-start gap-3">
                    <CustomerAvatar name={customer.name} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-dash-text">{customer.name}</p>
                          <p className="mt-0.5 text-xs font-medium text-slate-500">{customer.phone}</p>
                        </div>
                        {customer.orderCount > 1 ? (
                          <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            Repeat
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2 border-t border-dash-border pt-3">
                    <MobileDashRow label="Orders" value={customer.orderCount} />
                    <MobileDashRow
                      label="Total spent"
                      value={formatCustomerSpent(customer.totalSpent)}
                    />
                    <MobileDashRow
                      label="Last order"
                      value={formatRelativeTime(customer.lastOrderAt)}
                    />
                    <MobileDashRow label="Address" value={customer.address} />
                  </div>
                  <div className="mt-3 flex justify-end">
                    <CustomerRowActions customer={customer} onView={setViewCustomer} />
                  </div>
                </MobileDashCard>
              </div>
            ))}
          </MobileCardList>

          <DesktopTable>
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-dash-border bg-slate-50/90">
                  <th className="min-w-[180px] px-5 py-2.5 text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                    Customer
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                    Phone
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                    Orders
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                    Total spent
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                    Last order
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                    Address
                  </th>
                  <th className="w-[72px] px-4 py-2.5 text-right text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedItems.map((customer) => (
                  <tr
                    key={customer.id}
                    className="group transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-3">
                        <CustomerAvatar name={customer.name} />
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium text-dash-text">
                            {customer.name}
                          </p>
                          {customer.orderCount > 1 ? (
                            <span className="mt-0.5 inline-flex rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                              Repeat customer
                            </span>
                          ) : (
                            <span className="mt-0.5 text-[10px] text-slate-400">New customer</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-[13px] font-medium tabular-nums text-slate-600">
                        {customer.phone}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex min-w-[1.75rem] items-center justify-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-700">
                        {customer.orderCount}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-[13px] font-semibold tabular-nums text-dash-text">
                        {formatCustomerSpent(customer.totalSpent)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-[11px] text-slate-400">
                      {formatRelativeTime(customer.lastOrderAt)}
                    </td>
                    <td className="max-w-[200px] px-4 py-2.5">
                      <p className="truncate text-[13px] text-slate-500">{customer.address}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end opacity-80 transition-opacity group-hover:opacity-100">
                        <CustomerRowActions customer={customer} onView={setViewCustomer} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DesktopTable>

          <TablePagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      )}

      <CustomerViewModal
        open={Boolean(viewCustomer)}
        customer={viewCustomer}
        onClose={() => setViewCustomer(null)}
      />
    </div>
  );
}
