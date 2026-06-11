"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Eye, ExternalLink, Loader2, Users, X } from "lucide-react";
import { useAdminOrders } from "@/hooks/useAdminOrders";
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
  buildCustomerProfiles,
  buildCustomerStats,
  formatCustomerSpent,
} from "@/lib/customerHelpers";
import { formatRelativeTime } from "@/lib/dashboardStats";
import {
  formatOrderDate,
  formatOrderTotal,
  getOrderStatusClass,
  getOrderStatusLabel,
} from "@/lib/orderHelpers";

const inputClass =
  "w-full border border-dash-border bg-white px-3 py-2.5 text-sm text-dash-text outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

function StatCard({ label, value, hint }) {
  return (
    <div className="dash-card p-4">
      <p className="text-[11px] font-semibold tracking-wide text-dash-muted uppercase">{label}</p>
      <p className="mt-2 text-2xl font-bold text-dash-text">{value}</p>
      {hint ? <p className="mt-1 text-xs text-dash-muted">{hint}</p> : null}
    </div>
  );
}

function OrderStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${getOrderStatusClass(status)}`}
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
            <div className="flex shrink-0 items-center justify-between border-b border-dash-border px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-dash-text">{customer.name}</h2>
                <p className="text-sm text-dash-muted">{customer.phone}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-md text-dash-muted transition-colors hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-md border border-dash-border bg-slate-50 p-3">
                  <p className="text-xs text-dash-muted">Total orders</p>
                  <p className="mt-1 text-lg font-bold text-dash-text">{customer.orderCount}</p>
                </div>
                <div className="rounded-md border border-dash-border bg-slate-50 p-3">
                  <p className="text-xs text-dash-muted">Total spent</p>
                  <p className="mt-1 text-lg font-bold text-indigo-600">
                    {formatCustomerSpent(customer.totalSpent)}
                  </p>
                </div>
                <div className="rounded-md border border-dash-border bg-slate-50 p-3">
                  <p className="text-xs text-dash-muted">Last order</p>
                  <p className="mt-1 text-sm font-semibold text-dash-text">
                    {formatRelativeTime(customer.lastOrderAt)}
                  </p>
                </div>
              </div>

              <div className="rounded-md border border-dash-border p-4">
                <p className="text-xs font-bold tracking-wide text-dash-muted uppercase">Address</p>
                <p className="mt-2 text-sm text-dash-text">{customer.address}</p>
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
                <p className="border-b border-dash-border pb-2 text-xs font-bold tracking-wide text-dash-muted uppercase">
                  Order history
                </p>
                <div className="mt-3 space-y-2">
                  {customer.orders.map((order) => (
                    <div
                      key={order._id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-dash-border p-3"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-indigo-600">{order.order_number}</p>
                        <p className="text-xs text-dash-muted">{formatOrderDate(order.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <OrderStatusBadge status={order.status} />
                        <span className="text-sm font-semibold text-dash-text">
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
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-dash-border bg-white text-dash-muted transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
    >
      <Eye className="h-4 w-4" />
    </button>
  );
}

export default function CustomersManager() {
  const { data: orders = [], isLoading, isError, error, refetch } = useAdminOrders();
  const [search, setSearch] = useState("");
  const [viewCustomer, setViewCustomer] = useState(null);

  const customers = useMemo(() => buildCustomerProfiles(orders), [orders]);
  const stats = useMemo(() => buildCustomerStats(customers), [customers]);

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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-indigo-600 uppercase">
            CRM
          </p>
          <h1 className="text-2xl font-bold text-dash-text">Customer Directory</h1>
          <p className="mt-1 text-sm text-dash-muted">
            Customer profiles and purchase history from live orders.
          </p>
        </div>
        <p className="text-sm font-semibold text-dash-muted">{customers.length} customers</p>
      </motion.div>

      {!isLoading && !isError && customers.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Total customers" value={stats.totalCustomers} />
          <StatCard
            label="Repeat customers"
            value={stats.repeatCustomers}
            hint="More than one order"
          />
          <StatCard label="Lifetime value" value={formatCustomerSpent(stats.totalSpent)} />
        </div>
      ) : null}

      {customers.length > 0 ? (
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, phone, or address..."
          className={`${inputClass} max-w-md`}
        />
      ) : null}

      {isLoading ? (
        <div className="dash-card flex min-h-[280px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
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
          <p className="mt-2 text-sm text-dash-muted">
            {customers.length === 0
              ? "Customers will appear here after their first order."
              : "Try a different search term."}
          </p>
        </div>
      ) : (
        <div className="dash-card overflow-hidden">
          <MobileCardList className="p-3">
            {paginatedItems.map((customer, index) => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <MobileDashCard>
                  <div>
                    <p className="font-bold text-dash-text">{customer.name}</p>
                    <p className="mt-1 text-sm text-indigo-600">{customer.phone}</p>
                  </div>
                  <div className="mt-3 space-y-2">
                    <MobileDashRow label="Orders" value={customer.orderCount} />
                    <MobileDashRow label="Total spent" value={formatCustomerSpent(customer.totalSpent)} />
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
              </motion.div>
            ))}
          </MobileCardList>

          <DesktopTable>
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-dash-border bg-slate-50 text-[11px] font-semibold tracking-wide text-dash-muted uppercase">
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Total spent</th>
                  <th className="px-4 py-3">Last order</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((customer, index) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-dash-border last:border-b-0 hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-3 font-semibold text-dash-text">{customer.name}</td>
                    <td className="px-4 py-3 text-indigo-600">{customer.phone}</td>
                    <td className="px-4 py-3 text-dash-text">{customer.orderCount}</td>
                    <td className="px-4 py-3 font-semibold text-dash-text">
                      {formatCustomerSpent(customer.totalSpent)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-dash-muted">
                      {formatRelativeTime(customer.lastOrderAt)}
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-dash-muted">
                      {customer.address}
                    </td>
                    <td className="px-4 py-3">
                      <CustomerRowActions customer={customer} onView={setViewCustomer} />
                    </td>
                  </motion.tr>
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
