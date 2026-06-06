"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  Circle,
  Clock3,
  Eye,
  MapPin,
  Package,
  Phone,
  Search,
  ShieldCheck,
  Truck,
  Warehouse,
  X,
} from "lucide-react";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import {
  DesktopTable,
  MobileCardList,
  MobileDashCard,
  MobileDashRow,
  mobileModalClass,
} from "@/components/shared/ResponsiveTable";
import StoreShell from "@/components/layout/StoreShell";
import { fetchOrdersByPhone } from "@/lib/api/orders";
import { isValidBdPhone, normalizePhone } from "@/lib/orderValidation";

const TRACKING_ORDER_LIMIT = 5;

const steps = [
  { label: "অর্ডার গ্রহণ", desc: "আমরা আপনার অর্ডার পেয়েছি", icon: HiOutlineClipboardDocumentList },
  { label: "প্রসেসিং", desc: "পণ্য প্রস্তুত করা হচ্ছে", icon: Warehouse },
  { label: "প্রেরিত", desc: "আপনার পথে রয়েছে", icon: Truck },
  { label: "ডেলিভার", desc: "সফলভাবে ডেলিভার করা হয়েছে", icon: CheckCircle2 },
];

const STATUS_MAP = {
  pending: { step: 1, label: "অর্ডার গ্রহণ" },
  processing: { step: 2, label: "প্রসেসিং" },
  shipped: { step: 3, label: "প্রেরিত" },
  delivered: { step: 4, label: "ডেলিভার সম্পন্ন" },
  cancelled: { step: 0, label: "বাতিল" },
};

function mapOrderToView(order) {
  const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending;
  const items = order.items || [];

  return {
    _id: order._id,
    id: order.order_number,
    customer: order.customer?.name || "—",
    phone: order.customer?.phone || "",
    items: items.map((item) => ({
      title: item.title || "পণ্য",
      image: item.image || "",
      quantity: item.quantity || 1,
      selected_variant: item.selected_variant || "",
      price: item.price || 0,
      line_total: item.line_total || (item.price || 0) * (item.quantity || 1),
    })),
    itemCount: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
    total: `৳${Number(order.pricing?.total || 0).toLocaleString()}`,
    totalRaw: order.pricing?.total || 0,
    delivery: order.delivery?.label || "—",
    status: order.status,
    statusLabel: statusInfo.label,
    date: order.createdAt
      ? new Date(order.createdAt).toLocaleDateString("bn-BD", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—",
    address: order.customer?.address || "—",
    currentStep: statusInfo.step,
  };
}

function StatusBadge({ status, label }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase sm:text-[11px] ${
        status === "delivered"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : status === "cancelled"
            ? "border-rose-200 bg-rose-50 text-rose-700"
            : status === "shipped"
              ? "border-violet-200 bg-violet-50 text-violet-700"
              : status === "processing"
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-indigo-200 bg-indigo-50 text-indigo-700"
      }`}
    >
      {label}
    </span>
  );
}

function OrderItemsList({ items }) {
  if (!items?.length) return null;

  return (
    <div className="mt-5 border-t border-zinc-100 pt-5">
      <p className="mb-3 text-[10px] font-bold tracking-[0.16em] text-zinc-400 uppercase">
        অর্ডারকৃত পণ্য
      </p>
      <div className="space-y-2.5">
        {items.map((item, index) => (
          <div
            key={`${item.title}-${item.selected_variant}-${index}`}
            className="flex items-center gap-3 rounded-md border border-zinc-100 bg-zinc-50/80 p-2.5"
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-white sm:h-14 sm:w-14">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  unoptimized
                  className="object-cover object-center"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-300">
                  <Package className="h-4 w-4" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900">
                {item.title}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">
                {item.selected_variant ? `${item.selected_variant} · ` : ""}
                {item.quantity}টি × ৳{item.price.toLocaleString()}
              </p>
            </div>
            <p className="shrink-0 text-sm font-bold text-indigo-600">
              ৳{item.line_total.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeliveryProgress({ order }) {
  if (order.currentStep <= 0) return null;

  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50/50 p-5 sm:p-6">
      <h2 className="mb-6 text-base font-bold text-zinc-900 sm:text-lg">ডেলিভারি অগ্রগতি</h2>
      <div className="relative">
        <div className="absolute top-5 left-5 hidden h-[calc(100%-2.5rem)] w-px bg-zinc-200 sm:block" />
        <div className="space-y-6">
          {steps.map((step, index) => {
            const stepNum = index + 1;
            const done = stepNum <= order.currentStep;
            const active = stepNum === order.currentStep;
            const Icon = step.icon;

            return (
              <div key={step.label} className="flex gap-4 sm:gap-5">
                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    done
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-zinc-200 bg-white text-zinc-300"
                  } ${active ? "ring-4 ring-indigo-100" : ""}`}
                >
                  {done ? <Icon className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                </div>
                <div className="min-w-0 pt-1">
                  <p
                    className={`text-sm font-semibold sm:text-base ${
                      done ? "text-zinc-900" : "text-zinc-400"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500 sm:text-sm">{step.desc}</p>
                  {active ? (
                    <span className="mt-2 inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-600">
                      বর্তমান স্ট্যাটাস
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function OrderDetailModal({ order, onClose }) {
  return (
    <AnimatePresence>
      {order ? (
        <>
          <motion.button
            type="button"
            aria-label="বন্ধ করুন"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className={`${mobileModalClass} sm:max-w-2xl`}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 px-5 py-4">
              <div>
                <p className="text-[10px] font-bold tracking-[0.16em] text-zinc-400 uppercase">
                  অর্ডার বিস্তারিত
                </p>
                <p className="text-lg font-bold text-indigo-600">{order.id}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <StatusBadge status={order.status} label={order.statusLabel} />
                <p className="text-sm text-zinc-500">{order.date}</p>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  { label: "গ্রাহক", value: order.customer },
                  { label: "ফোন", value: order.phone },
                  { label: "মোট", value: order.total },
                  { label: "ডেলিভারি", value: order.delivery },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-md border border-zinc-100 bg-zinc-50/60 p-3"
                  >
                    <p className="text-[10px] font-bold tracking-wide text-zinc-400 uppercase">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-900">{item.value}</p>
                  </div>
                ))}
              </div>

              <OrderItemsList items={order.items} />

              <div className="mt-4 flex items-start gap-2 rounded-md border border-zinc-100 bg-white p-3 text-sm text-zinc-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                {order.address}
              </div>

              <div className="mt-6">
                <DeliveryProgress order={order} />
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

export default function OrdersTrackingView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneParam = normalizePhone(searchParams.get("phone") || "");

  const [phone, setPhone] = useState(phoneParam);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
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
      setSelectedOrder(null);
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-md border border-indigo-100/80 bg-gradient-to-br from-indigo-50 via-white to-violet-50/60 p-5 sm:p-6 lg:p-7">
        <div
          className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-indigo-200/30 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-violet-200/25 blur-3xl"
          aria-hidden
        />

        <div className="relative grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-[10px] font-bold tracking-[0.22em] text-indigo-600 uppercase sm:text-[11px]">
              অর্ডার ট্র্যাকিং
            </p>
            <h1 className="mt-2 text-[1.5rem] leading-tight font-bold tracking-tight text-zinc-900 sm:text-2xl lg:text-[1.85rem]">
              আমার অর্ডার কোথায়?
            </h1>
            <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-zinc-600 sm:text-sm">
              চেকআউটে ব্যবহার করা মোবাইল নাম্বার দিয়ে সর্বশেষ {TRACKING_ORDER_LIMIT}টি
              অর্ডারের স্ট্যাটাস ও বিস্তারিত দেখুন।
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 shadow-sm sm:text-xs">
                <Phone className="h-3.5 w-3.5 text-indigo-600" />
                ফোন দিয়ে ট্র্যাক
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 shadow-sm sm:text-xs">
                <Clock3 className="h-3.5 w-3.5 text-indigo-600" />
                সর্বশেষ {TRACKING_ORDER_LIMIT}টি
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 shadow-sm sm:text-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                নিরাপদ ও দ্রুত
              </div>
            </div>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleTrack}
            className="rounded-md border border-zinc-200/90 bg-white p-4 shadow-sm"
          >
            <label htmlFor="track-phone" className="mb-2 block text-xs font-semibold text-zinc-700">
              মোবাইল নাম্বার
            </label>
            <div className="flex min-w-0 flex-col gap-2.5 sm:flex-row">
              <div className="flex min-w-0 flex-1 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50/50 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                <span className="flex shrink-0 items-center border-r border-zinc-200 bg-zinc-100/80 px-3 text-xs font-semibold text-zinc-500">
                  +88
                </span>
                <input
                  id="track-phone"
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(event) => setPhone(normalizePhone(event.target.value))}
                  placeholder="01XXXXXXXXX"
                  required
                  className="min-w-0 flex-1 bg-transparent py-2.5 pr-3 pl-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                />
              </div>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60 sm:w-auto"
              >
                <Search className="h-4 w-4" />
                {loading ? "খুঁজছি..." : "অর্ডার খুঁজুন"}
              </motion.button>
            </div>
            <p className="mt-2.5 text-[11px] leading-relaxed text-zinc-400 sm:text-xs">
              উদাহরণ: 017XXXXXXXX — শুধু আপনার নম্বরের অর্ডার দেখানো হবে
            </p>
          </motion.form>
        </div>
      </div>

      <div className="mt-6 sm:mt-8">
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
              key="orders-table"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-4 flex items-end justify-between gap-3 border-b border-zinc-200/80 pb-3 sm:mb-5 sm:pb-4">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-indigo-600 uppercase">
                    ফলাফল
                  </p>
                  <h2 className="mt-1 text-base font-bold text-zinc-900 sm:text-lg">
                    আপনার অর্ডার
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500">{phone}</p>
                </div>
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                  {orders.length} / {TRACKING_ORDER_LIMIT}
                </span>
              </div>

              <div className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm">
                <MobileCardList className="p-3">
                  {orders.map((order, index) => (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <MobileDashCard>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="break-all text-sm font-bold text-indigo-600">{order.id}</p>
                            <p className="mt-1 text-xs text-zinc-500">{order.date}</p>
                          </div>
                          <StatusBadge status={order.status} label={order.statusLabel} />
                        </div>
                        <div className="mt-3 space-y-2">
                          <MobileDashRow label="পণ্য" value={`${order.itemCount}টি`} />
                          <MobileDashRow label="মোট" value={order.total} />
                          <MobileDashRow label="ডেলিভারি" value={order.delivery} />
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                        >
                          <Eye className="h-4 w-4" />
                          বিস্তারিত দেখুন
                        </button>
                      </MobileDashCard>
                    </motion.div>
                  ))}
                </MobileCardList>

                <DesktopTable>
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 bg-zinc-50 text-[11px] font-semibold tracking-wide text-zinc-400 uppercase">
                        <th className="px-4 py-3">অর্ডার আইডি</th>
                        <th className="px-4 py-3">তারিখ</th>
                        <th className="px-4 py-3">পণ্য</th>
                        <th className="px-4 py-3">মোট</th>
                        <th className="px-4 py-3">স্ট্যাটাস</th>
                        <th className="px-4 py-3">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, index) => (
                        <motion.tr
                          key={order._id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.04 }}
                          className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50/80"
                        >
                          <td className="px-4 py-3.5 font-semibold text-indigo-600">{order.id}</td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-zinc-600">{order.date}</td>
                          <td className="px-4 py-3.5 text-zinc-600">{order.itemCount}টি</td>
                          <td className="px-4 py-3.5 font-semibold text-zinc-900">{order.total}</td>
                          <td className="px-4 py-3.5">
                            <StatusBadge status={order.status} label={order.statusLabel} />
                          </td>
                          <td className="px-4 py-3.5">
                            <button
                              type="button"
                              aria-label="বিস্তারিত দেখুন"
                              title="View"
                              onClick={() => setSelectedOrder(order)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </DesktopTable>
              </div>
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
              <p className="mt-1 text-sm text-zinc-500">
                নম্বর যাচাই করে আবার চেষ্টা করুন অথবা নতুন অর্ডার করুন।
              </p>
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
                {
                  icon: Phone,
                  title: "ফোন নম্বর দিন",
                  desc: "চেকআউটের সময় যে নম্বর ব্যবহার করেছেন সেটি লিখুন",
                },
                {
                  icon: Search,
                  title: "অর্ডার খুঁজুন",
                  desc: "সর্বশেষ ৫টি অর্ডারের তালিকা ও স্ট্যাটাস দেখুন",
                },
                {
                  icon: Truck,
                  title: "লাইভ ট্র্যাকিং",
                  desc: "বিস্তারিত থেকে ডেলিভারি অগ্রগতি দেখুন",
                },
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

      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        </div>
      </section>
    </StoreShell>
  );
}
