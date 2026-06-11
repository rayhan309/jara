"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { CheckCircle2, Copy, Package } from "lucide-react";
import toast from "react-hot-toast";
import StoreShell from "@/components/layout/StoreShell";
import { formatDisplayOrderNumber } from "@/lib/orderHelpers";
import { trackMetaEvent } from "@/lib/metaPixel";

export default function ThankYou() {
  const [orderInfo, setOrderInfo] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("nexa_last_order");
      if (!raw) return;

      const parsed = JSON.parse(raw);
      setOrderInfo(parsed);
      sessionStorage.removeItem("nexa_last_order");

      const items = parsed.items || [];
      trackMetaEvent("Purchase", {
        value: Number(parsed.total || 0),
        currency: parsed.currency || "BDT",
        content_ids: items.map((item) => String(item.id)),
        content_type: "product",
        contents: items.map((item) => ({
          id: String(item.id),
          quantity: item.quantity,
          item_price: item.price,
        })),
        num_items: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
        order_id: formatDisplayOrderNumber(parsed.order_number),
      });
    } catch {
      setOrderInfo(null);
    }
  }, []);

  const displayOrderNumber = orderInfo?.order_number
    ? formatDisplayOrderNumber(orderInfo.order_number)
    : null;

  async function handleCopyOrderId() {
    if (!displayOrderNumber) return;

    try {
      await navigator.clipboard.writeText(displayOrderNumber);
      setCopied(true);
      toast.success("অর্ডার নম্বর কপি হয়েছে");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("কপি করা যায়নি");
    }
  }

  const trackHref = orderInfo?.phone
    ? `/orders-traking?phone=${encodeURIComponent(orderInfo.phone)}`
    : "/orders-traking";

  return (
    <StoreShell className="bg-zinc-50">
      <div className="store-container py-12 sm:py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-lg text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 220, delay: 0.15 }}
            className="rounded-md mx-auto mb-6 flex h-20 w-20 items-center justify-center border border-emerald-200 bg-emerald-50"
          >
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </motion.div>

          <p className="text-xs font-semibold tracking-[0.12em] text-emerald-600">
            অর্ডার নিশ্চিত
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            আপনার অর্ডারের জন্য ধন্যবাদ!
          </h1>

          {displayOrderNumber ? (
            <div className="mt-4 rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700">
              <p className="text-xs font-semibold text-zinc-400">অর্ডার নম্বর</p>
              <div className="mt-1 flex items-center justify-center gap-2">
                <span className="font-bold text-indigo-600">{displayOrderNumber}</span>
                <button
                  type="button"
                  onClick={handleCopyOrderId}
                  aria-label="অর্ডার নম্বর কপি করুন"
                  className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? "কপি হয়েছে" : "কপি"}
                </button>
              </div>
              {orderInfo.total ? (
                <p className="mt-2 text-zinc-600">
                  মোট:{" "}
                  <span className="font-semibold text-zinc-900">
                    ৳{Number(orderInfo.total).toLocaleString()}
                  </span>
                </p>
              ) : null}
            </div>
          ) : null}

          <p className="mt-4 text-sm leading-relaxed text-zinc-500 sm:text-base">
            আমরা আপনার অর্ডার পেয়েছি। শীঘ্রই আপনার সাথে যোগাযোগ করা হবে।
            যেকোনো সময় ডেলিভারি ট্র্যাক করতে পারবেন।
          </p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
          >
            <Link href={trackHref}>
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white sm:w-auto"
              >
                <Package className="h-4 w-4" />
                অর্ডার ট্র্যাক করুন
              </motion.span>
            </Link>
            <Link href="/">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-md inline-flex w-full items-center justify-center gap-2 border border-zinc-200 bg-white px-6 py-3.5 text-sm font-semibold text-zinc-700 sm:w-auto"
              >
                কেনাকাটা চালিয়ে যান
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </StoreShell>
  );
}
