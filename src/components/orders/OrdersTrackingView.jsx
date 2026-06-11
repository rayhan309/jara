"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Check, Clock3, Copy, Package, Phone, Search, ShieldCheck, Truck } from "lucide-react";
import toast from "react-hot-toast";
import StoreShell from "@/components/layout/StoreShell";
import { fetchOrdersByPhone } from "@/lib/api/orders";
import { isValidBdPhone, normalizePhone } from "@/lib/orderValidation";
import {
  getOrderStatusClass,
  getOrderTrackingInfo,
  ORDER_TRACKING_STEPS,
} from "@/lib/orderHelpers";

const TRACKING_ORDER_LIMIT = 5;

function mapOrderToView(order) {
  const statusInfo = getOrderTrackingInfo(order.status);
  const items = order.items || [];

  return {
    _id: order._id,
    id: order.order_number,
    customer: order.customer?.name || "—",
    phone: order.customer?.phone || "",
    items: items.map((item) => ({
      title: item.title || "পণ্য",
      quantity: item.quantity || 1,
      line_total: item.line_total || (item.price || 0) * (item.quantity || 1),
    })),
    total: Number(order.pricing?.total || 0),
    totalFormatted: `৳ ${Number(order.pricing?.total || 0).toLocaleString()}`,
    paymentLabel: order.payment?.label || "Cash on Delivery",
    status: order.status,
    statusLabel: statusInfo.label,
    dateTime: order.createdAt
      ? new Date(order.createdAt).toLocaleString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "—",
    address: order.customer?.address || "—",
    currentStep: statusInfo.step,
  };
}

function StatusBadge({ status, label }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold sm:text-xs ${getOrderStatusClass(status)}`}
    >
      {label}
    </span>
  );
}

function OrderProgressStepper({ currentStep }) {
  if (currentStep <= 0) return null;

  return (
    <div className="relative mt-6 border-t border-zinc-100 pt-6">
      <div className="absolute top-[calc(1.5rem+0.75rem)] right-[10%] left-[10%] hidden h-0.5 bg-zinc-200 sm:block" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-2">
        {ORDER_TRACKING_STEPS.map((label, index) => {
          const stepNum = index + 1;
          const done = stepNum <= currentStep;

          return (
            <div key={label} className="relative flex flex-col items-center text-center">
              <div
                className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 sm:h-7 sm:w-7 ${
                  done
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-zinc-300 bg-white text-zinc-300"
                }`}
              >
                {done ? <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={3} /> : null}
              </div>
              <p
                className={`mt-2 text-[10px] leading-snug font-medium sm:text-[11px] ${
                  done ? "text-zinc-800" : "text-zinc-400"
                }`}
              >
                {label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderTrackingCard({ order, index }) {
  async function copyOrderId() {
    try {
      await navigator.clipboard.writeText(order.id);
      toast.success("অর্ডার আইডি কপি হয়েছে");
    } catch {
      toast.error("কপি করা যায়নি");
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm"
    >
      <div className="flex flex-col gap-3 border-b border-zinc-100 px-3 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-zinc-900 sm:text-lg">Order {order.id}</h3>
            <button
              type="button"
              onClick={copyOrderId}
              aria-label="অর্ডার আইডি কপি করুন"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-indigo-600 transition-colors hover:bg-indigo-50"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-1 text-xs text-zinc-500 sm:text-sm">{order.dateTime}</p>
        </div>
        <StatusBadge status={order.status} label={order.statusLabel} />
      </div>

      <div className="grid gap-4 border-b border-zinc-100 px-3 py-4 sm:grid-cols-3 sm:px-5 sm:py-5">
        <div>
          <p className="text-[10px] font-bold tracking-[0.14em] text-zinc-400 uppercase">Customer</p>
          <p className="mt-1.5 text-sm font-bold text-zinc-900">{order.customer}</p>
          <p className="mt-0.5 text-sm text-zinc-600">{order.phone}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-[0.14em] text-zinc-400 uppercase">
            Shipping Address
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-700">{order.address}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-[0.14em] text-zinc-400 uppercase">Payment</p>
          <p className="mt-1.5 text-sm text-zinc-700">{order.paymentLabel}</p>
          <p className="mt-1 text-base font-bold text-zinc-900">{order.totalFormatted}</p>
        </div>
      </div>

      <div className="divide-y divide-zinc-100 md:hidden">
        {order.items.map((item, itemIndex) => (
          <div
            key={`${item.title}-${itemIndex}`}
            className="flex items-start justify-between gap-3 px-4 py-3"
          >
            <p className="min-w-0 flex-1 line-clamp-2 text-sm font-medium text-zinc-800">
              {item.title}
            </p>
            <div className="shrink-0 text-right">
              <p className="text-xs text-zinc-500">×{item.quantity}</p>
              <p className="text-sm font-semibold text-zinc-900">
                ৳{item.line_total.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">
              <th className="px-4 py-2.5 text-left sm:px-5">Product</th>
              <th className="w-16 px-4 py-2.5 text-center sm:w-20">Qty</th>
              <th className="w-24 px-4 py-2.5 text-left sm:w-28 sm:px-5">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, itemIndex) => (
              <tr
                key={`${item.title}-${itemIndex}`}
                className="border-b border-zinc-100 last:border-b-0"
              >
                <td className="max-w-0 px-4 py-3 font-medium text-zinc-800 sm:px-5">
                  <span className="line-clamp-2">{item.title}</span>
                </td>
                <td className="px-4 py-3 text-center text-zinc-700">{item.quantity}</td>
                <td className="px-4 py-3 font-semibold text-zinc-900 sm:px-5">
                  ৳ {item.line_total.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 pb-5 sm:px-5">
        <OrderProgressStepper currentStep={order.currentStep} />
      </div>
    </motion.article>
  );
}

export default function OrdersTrackingView() {
  return (
    <Suspense fallback={<OrdersTrackingFallback />}>
      <OrdersTrackingContent />
    </Suspense>
  );
}

function OrdersTrackingFallback() {
  return (
    <StoreShell className="bg-zinc-50">
      <section className="py-6 sm:py-8 lg:py-10">
        <div className="store-container">
          <div className="overflow-hidden rounded-md border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="h-6 w-40 animate-pulse rounded-md bg-zinc-100" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded-md bg-zinc-100" />
            <div className="mt-4 h-11 animate-pulse rounded-md bg-zinc-100" />
          </div>
        </div>
      </section>
    </StoreShell>
  );
}

function OrdersTrackingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneParam = normalizePhone(searchParams.get("phone") || "");

  const [phone, setPhone] = useState(phoneParam);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(phoneParam));
  const fetchedPhoneRef = useRef("");

  const trackByPhone = useCallback(
    async (rawPhone, updateUrl = true) => {
      const normalized = normalizePhone(rawPhone);

      if (!normalized) {
        setError("ফোন নাম্বার লিখুন");
        return;
      }

      if (!isValidBdPhone(normalized)) {
        setError("সঠিক বাংলাদেশি মোবাইল নাম্বার দিন (01XXXXXXXXX)");
        return;
      }

      setError("");
      setOrders([]);
      setLoading(true);
      setHasSearched(true);
      fetchedPhoneRef.current = normalized;

      try {
        const result = await fetchOrdersByPhone(normalized);
        setOrders(result.map(mapOrderToView));

        if (updateUrl) {
          const params = new URLSearchParams();
          params.set("phone", normalized);
          router.replace(`/orders-traking?${params.toString()}`, { scroll: false });
        }
      } catch (err) {
        setError(err.message || "কোনো অর্ডার পাওয়া যায়নি");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    if (!phoneParam || fetchedPhoneRef.current === phoneParam) return;
    setPhone(phoneParam);
    trackByPhone(phoneParam, false);
  }, [phoneParam, trackByPhone]);

  function handleTrack(event) {
    event.preventDefault();
    trackByPhone(phone);
  }

  return (
    <StoreShell className="bg-zinc-50">
      <section className="py-6 sm:py-8 lg:py-10">
        <div className="store-container">
          <div className="overflow-hidden rounded-md border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
            <h1 className="text-lg font-bold text-zinc-900 sm:text-xl">Track Your Order</h1>
            <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
              চেকআউটের ফোন নম্বর দিয়ে সর্বশেষ {TRACKING_ORDER_LIMIT}টি অর্ডার দেখুন
            </p>

            <form onSubmit={handleTrack} className="mt-4 flex min-w-0 flex-col gap-2.5 sm:flex-row">
              <div className="flex min-w-0 flex-1 overflow-hidden rounded-md border border-zinc-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                <span className="flex shrink-0 items-center border-r border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold text-zinc-500">
                  +88
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(event) => setPhone(normalizePhone(event.target.value))}
                  placeholder="01XXXXXXXXX"
                  required
                  className="min-w-0 flex-1 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
              >
                <Search className="h-4 w-4" />
                {loading ? "Searching..." : "Search"}
              </button>
            </form>
          </div>

          <div className="mt-6 space-y-5 sm:mt-8">
            <AnimatePresence mode="wait">
              {error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-md border border-red-200 bg-red-50 px-4 py-4 text-center text-sm text-red-600"
                >
                  {error}
                </motion.div>
              ) : null}

              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex min-h-[200px] flex-col items-center justify-center rounded-md border border-zinc-200 bg-white p-8"
                >
                  <Package className="mb-3 h-9 w-9 animate-pulse text-indigo-500" />
                  <p className="text-sm font-medium text-zinc-600">অর্ডার খুঁজছি...</p>
                </motion.div>
              ) : orders.length > 0 ? (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  {orders.map((order, index) => (
                    <OrderTrackingCard key={order._id} order={order} index={index} />
                  ))}
                </motion.div>
              ) : hasSearched && !error ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-md border border-dashed border-zinc-200 bg-white px-6 py-14 text-center"
                >
                  <Package className="mx-auto h-10 w-10 text-zinc-300" />
                  <p className="mt-4 text-sm font-semibold text-zinc-700">কোনো অর্ডার পাওয়া যায়নি</p>
                </motion.div>
              ) : (
                <motion.div
                  key="hint"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="grid gap-3 sm:grid-cols-3"
                >
                  {[
                    { icon: Phone, title: "ফোন নম্বর দিন", desc: "চেকআউটের নম্বর ব্যবহার করুন" },
                    { icon: Search, title: "Search করুন", desc: "সর্বশেষ ৫টি অর্ডার দেখুন" },
                    { icon: Truck, title: "স্ট্যাটাস দেখুন", desc: "পণ্য টেবিল ও progress bar" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.title}
                        className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm"
                      >
                        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
                          <Icon className="h-4 w-4" />
                        </div>
                        <p className="text-sm font-bold text-zinc-900">{item.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-zinc-500">{item.desc}</p>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </StoreShell>
  );
}
