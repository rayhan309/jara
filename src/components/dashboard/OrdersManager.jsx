"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "motion/react";
import { Eye, Loader2, Pencil, ShoppingBag, Trash2, X } from "lucide-react";
import { FieldError } from "@/components/dashboard/DashboardFormUi";
import {
  useAdminOrders,
  useDeleteAdminOrder,
  useUpdateAdminOrder,
} from "@/hooks/useAdminOrders";
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
  formatOrderDate,
  formatOrderTotal,
  getOrderItemSummary,
  getOrderStatusClass,
  getOrderStatusLabel,
  ORDER_STATUSES,
} from "@/lib/orderHelpers";
import { DELIVERY_OPTIONS } from "@/lib/orderValidation";

const inputClass =
  "w-full rounded-md border border-dash-border bg-white px-3 py-2.5 text-sm text-dash-text outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

const labelClass = "mb-1.5 block text-sm font-semibold text-dash-text";

function SectionTitle({ children }) {
  return (
    <h3 className="border-b border-dash-border pb-2 text-xs font-bold tracking-[0.14em] text-dash-muted uppercase">
      {children}
    </h3>
  );
}

function OrderStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase ${getOrderStatusClass(status)}`}
    >
      {getOrderStatusLabel(status)}
    </span>
  );
}

function ModalShell({ open, title, onClose, children, wide = false }) {
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
            className={`${mobileDashModalClass} ${wide ? "sm:max-w-3xl" : "sm:max-w-xl"}`}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-dash-border px-5 py-4">
              <h2 className="text-lg font-bold text-dash-text">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md flex h-8 w-8 items-center justify-center text-dash-muted transition-colors hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function OrderViewModal({ open, onClose, order }) {
  if (!order) return null;

  return (
    <ModalShell open={open} title={`Order ${order.order_number}`} onClose={onClose} wide>
      <div className="space-y-6 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-dash-muted">Order ID</p>
            <p className="mt-1 text-lg font-bold text-indigo-600">{order.order_number}</p>
            <p className="mt-1 text-xs text-dash-muted">{formatOrderDate(order.createdAt)}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-dash-border p-4">
            <SectionTitle>Customer</SectionTitle>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-xs text-dash-muted">Name</dt>
                <dd className="font-semibold text-dash-text">{order.customer?.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-dash-muted">Phone</dt>
                <dd className="font-semibold text-dash-text">{order.customer?.phone}</dd>
              </div>
              <div>
                <dt className="text-xs text-dash-muted">Address</dt>
                <dd className="text-dash-text">{order.customer?.address}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-md border border-dash-border p-4">
            <SectionTitle>Delivery & Payment</SectionTitle>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-xs text-dash-muted">Delivery</dt>
                <dd className="font-semibold text-dash-text">
                  {order.delivery?.label} — ৳{order.delivery?.charge?.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-dash-muted">Payment</dt>
                <dd className="font-semibold text-dash-text">{order.payment?.label || "Cash On Delivery"}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div>
          <SectionTitle>Items</SectionTitle>
          <div className="mt-3 space-y-3">
            {(order.items || []).map((item, index) => (
              <div
                key={`${item.product_id}-${item.selected_variant}-${index}`}
                className="flex gap-3 rounded-md border border-dash-border p-3"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-slate-100">
                  {item.image ? (
                    <Image src={item.image} alt={item.title} fill unoptimized className="object-contain p-1" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-dash-muted">
                      <ShoppingBag className="h-5 w-5 opacity-40" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-dash-text">{item.title}</p>
                  {item.selected_variant ? (
                    <p className="text-xs text-dash-muted">Variant: {item.selected_variant}</p>
                  ) : null}
                  <p className="mt-1 text-sm text-dash-muted">
                    ৳{item.price?.toLocaleString()} × {item.quantity} ={" "}
                    <span className="font-semibold text-dash-text">৳{item.line_total?.toLocaleString()}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-dash-border bg-slate-50 p-4 text-sm">
          <div className="flex justify-between text-dash-muted">
            <span>Subtotal</span>
            <span className="font-semibold text-dash-text">৳{order.pricing?.subtotal?.toLocaleString()}</span>
          </div>
          {order.pricing?.discount > 0 ? (
            <div className="mt-2 flex justify-between text-emerald-600">
              <span>Discount</span>
              <span className="font-semibold">-৳{order.pricing.discount.toLocaleString()}</span>
            </div>
          ) : null}
          <div className="mt-2 flex justify-between text-dash-muted">
            <span>Delivery</span>
            <span className="font-semibold text-dash-text">৳{order.pricing?.delivery_charge?.toLocaleString()}</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-dash-border pt-3">
            <span className="font-bold text-dash-text">Total</span>
            <span className="text-lg font-bold text-indigo-600">{formatOrderTotal(order)}</span>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

function OrderEditModal({ open, onClose, order }) {
  const { mutate: updateOrder, isPending } = useUpdateAdminOrder();
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      status: "pending",
      name: "",
      phone: "",
      address: "",
      delivery_method: "outside_dhaka",
    },
  });

  useEffect(() => {
    if (!open || !order) return;

    reset({
      status: order.status || "pending",
      name: order.customer?.name || "",
      phone: order.customer?.phone || "",
      address: order.customer?.address || "",
      delivery_method: order.delivery?.method || "outside_dhaka",
    });
    setSubmitError("");
  }, [open, order, reset]);

  function handleClose() {
    if (isPending) return;
    onClose();
  }

  function onSubmit(values) {
    setSubmitError("");

    updateOrder(
      {
        id: order._id,
        payload: {
          status: values.status,
          customer: {
            name: values.name,
            phone: values.phone,
            address: values.address,
          },
          delivery: { method: values.delivery_method },
        },
      },
      {
        onSuccess: () => onClose(),
        onError: (error) => setSubmitError(error.message || "Update failed."),
      }
    );
  }

  if (!order) return null;

  return (
    <ModalShell open={open} title={`Edit Order ${order.order_number}`} onClose={handleClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        <div className="space-y-4 p-5 sm:p-6">
          <div>
            <label className={labelClass}>Status</label>
            <select {...register("status")} className={inputClass}>
              {ORDER_STATUSES.map((entry) => (
                <option key={entry.value} value={entry.value}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>

          <SectionTitle>Customer</SectionTitle>

          <div>
            <label className={labelClass}>Name</label>
            <input
              {...register("name", { required: "Name is required." })}
              className={inputClass}
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div>
            <label className={labelClass}>Phone</label>
            <input
              {...register("phone", { required: "Phone is required." })}
              className={inputClass}
            />
            <FieldError message={errors.phone?.message} />
          </div>

          <div>
            <label className={labelClass}>Address</label>
            <textarea
              rows={3}
              {...register("address", { required: "Address is required." })}
              className={`${inputClass} resize-none`}
            />
            <FieldError message={errors.address?.message} />
          </div>

          <div>
            <label className={labelClass}>Delivery Method</label>
            <select {...register("delivery_method")} className={inputClass}>
              {Object.entries(DELIVERY_OPTIONS).map(([key, option]) => (
                <option key={key} value={key}>
                  {option.label} — ৳{option.charge}
                </option>
              ))}
            </select>
          </div>

          {submitError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {submitError}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-dash-border bg-white p-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="rounded-md border border-dash-border px-4 py-2.5 text-sm font-semibold text-dash-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function OrderRowActions({ order, onView, onEdit, onDelete, isDeleting }) {
  const iconBtn =
    "inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors";

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        aria-label="View order"
        title="View"
        onClick={() => onView(order)}
        className={`${iconBtn} border-slate-200 bg-white text-dash-text hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700`}
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Edit order"
        title="Edit"
        onClick={() => onEdit(order)}
        className={`${iconBtn} border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100`}
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Delete order"
        title="Delete"
        onClick={() => onDelete(order)}
        disabled={isDeleting}
        className={`${iconBtn} border-red-200 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-60`}
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

export default function OrdersManager() {
  const { data: orders = [], isLoading, isError, error, refetch } = useAdminOrders();
  const { mutate: deleteOrder, isPending: isDeleting, variables: deletingId } = useDeleteAdminOrder();

  const [viewOrder, setViewOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();

    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      if (!term) return true;

      return (
        order.order_number?.toLowerCase().includes(term) ||
        order.customer?.name?.toLowerCase().includes(term) ||
        order.customer?.phone?.includes(term)
      );
    });
  }, [orders, search, statusFilter]);

  const { page, setPage, totalPages, totalItems, pageSize, paginatedItems } =
    usePagination(filteredOrders);

  function handleDelete(order) {
    if (!window.confirm(`Delete order "${order.order_number}"? Stock will be restored.`)) return;
    deleteOrder(order._id);
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-indigo-600 uppercase">
            Fulfillment
          </p>
          <h1 className="text-2xl font-bold text-dash-text">Orders</h1>
          <p className="mt-1 text-sm text-dash-muted">
            View, update status, and manage customer orders.
          </p>
        </div>
        <p className="text-sm font-semibold text-dash-muted">{orders.length} total orders</p>
      </motion.div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by order ID, name, or phone..."
          className={`${inputClass} sm:max-w-sm`}
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className={`${inputClass} sm:w-44`}
        >
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((entry) => (
            <option key={entry.value} value={entry.value}>
              {entry.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="dash-card flex min-h-[280px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : isError ? (
        <div className="dash-card border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-600">{error?.message || "Failed to load orders."}</p>
          <button type="button" onClick={() => refetch()} className="mt-3 text-sm font-semibold text-indigo-600">
            Try again
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="dash-card flex min-h-[280px] flex-col items-center justify-center p-10 text-center">
          <ShoppingBag className="mb-4 h-10 w-10 text-indigo-600" />
          <h2 className="text-lg font-bold text-dash-text">
            {orders.length === 0 ? "No orders yet" : "No matching orders"}
          </h2>
          <p className="mt-2 text-sm text-dash-muted">
            {orders.length === 0
              ? "Customer orders will appear here after checkout."
              : "Try a different search or filter."}
          </p>
        </div>
      ) : (
        <div className="dash-card overflow-hidden">
          <MobileCardList className="p-3">
            {paginatedItems.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <MobileDashCard>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="break-all text-sm font-bold text-indigo-600">{order.order_number}</p>
                      <p className="mt-1 text-xs text-dash-muted">{formatOrderDate(order.createdAt)}</p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="mt-3 space-y-2">
                    <MobileDashRow label="Customer" value={order.customer?.name} />
                    <MobileDashRow label="Phone" value={order.customer?.phone} />
                    <MobileDashRow label="Total" value={formatOrderTotal(order)} />
                    <MobileDashRow label="Items" value={getOrderItemSummary(order)} />
                  </div>
                  <div className="mt-3 flex justify-end">
                    <OrderRowActions
                      order={order}
                      onView={setViewOrder}
                      onEdit={setEditOrder}
                      onDelete={handleDelete}
                      isDeleting={isDeleting && deletingId === order._id}
                    />
                  </div>
                </MobileDashCard>
              </motion.div>
            ))}
          </MobileCardList>

          <DesktopTable>
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-dash-border bg-slate-50 text-[11px] font-semibold tracking-wide text-dash-muted uppercase">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((order, index) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-dash-border last:border-b-0 hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-3 font-semibold text-indigo-600">{order?.order_number}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-dash-text">{order.customer?.name}</p>
                      <p className="text-xs text-dash-muted">{order.customer?.phone}</p>
                    </td>
                    <td className="max-w-[180px] truncate px-4 py-3 text-dash-muted">
                      {getOrderItemSummary(order)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-dash-text">{formatOrderTotal(order)}</td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-dash-muted whitespace-nowrap">
                      {formatOrderDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <OrderRowActions
                        order={order}
                        onView={setViewOrder}
                        onEdit={setEditOrder}
                        onDelete={handleDelete}
                        isDeleting={isDeleting && deletingId === order._id}
                      />
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

      <OrderViewModal open={Boolean(viewOrder)} order={viewOrder} onClose={() => setViewOrder(null)} />
      <OrderEditModal open={Boolean(editOrder)} order={editOrder} onClose={() => setEditOrder(null)} />
    </div>
  );
}
