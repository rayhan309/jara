"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Package, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { getMaxLineQuantity } from "@/lib/cart";

export default function CartSidebar({ open, onClose }) {
  const router = useRouter();
  const { items, count, updateQuantity, removeFromCart } = useCart();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function handleCheckout() {
    onClose();
    router.push("/checkout");
  }

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="কার্ট বন্ধ করুন"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-zinc-900/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-y-0 right-0 z-[70] flex w-[min(100%,380px)] flex-col border-l border-zinc-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
              <div>
                <p className="text-sm font-bold text-zinc-900">আপনার কার্ট</p>
                <p className="text-xs text-zinc-500">{count}টি আইটেম</p>
              </div>
              <button
                type="button"
                aria-label="কার্ট বন্ধ করুন"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <ShoppingBag className="h-12 w-12 text-zinc-300" />
                <p className="mt-4 text-sm font-medium text-zinc-700">কার্ট খালি</p>
                <p className="mt-1 text-xs text-zinc-500">পণ্য যোগ করতে কার্ট বাটনে ক্লিক করুন</p>
                <Link
                  href="/products"
                  onClick={onClose}
                  className="mt-5 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  পণ্য দেখুন
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {items.map((item) => (
                    <div
                      key={`${item._id}-${item.selected_variant || "default"}`}
                      className="flex gap-3 rounded-md border border-zinc-200 bg-zinc-50/50 p-3"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-white">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            unoptimized
                            className="object-contain p-1"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-zinc-300">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold text-zinc-900">{item.title}</p>
                        {item.selected_variant ? (
                          <p className="mt-0.5 text-[11px] font-medium text-zinc-500">
                            {item.variant_type === "weight" ? "ওজন" : "সাইজ"}: {item.selected_variant}
                          </p>
                        ) : null}
                        <p className="mt-0.5 text-xs font-bold text-indigo-600">
                          ৳{item.price.toLocaleString()}
                        </p>

                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="inline-flex items-center rounded-md border border-zinc-200 bg-white">
                            <button
                              type="button"
                              aria-label="পরিমাণ কমান"
                              onClick={() =>
                                updateQuantity(
                                  item._id,
                                  item.quantity - 1,
                                  item.title,
                                  item.selected_variant
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center text-zinc-600 transition-colors hover:bg-zinc-50"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-[2rem] text-center text-sm font-semibold text-zinc-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              aria-label="পরিমাণ বাড়ান"
                              onClick={() =>
                                updateQuantity(
                                  item._id,
                                  item.quantity + 1,
                                  item.title,
                                  item.selected_variant
                                )
                              }
                              disabled={item.quantity >= getMaxLineQuantity(item, items)}
                              className="flex h-8 w-8 items-center justify-center text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            aria-label="কার্ট থেকে সরান"
                            onClick={() => removeFromCart(item._id, item.title, item.selected_variant)}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-rose-500 transition-colors hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-zinc-100 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-zinc-600">মোট</span>
                    <span className="text-lg font-bold text-zinc-900">৳{total.toLocaleString()}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full rounded-md bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                  >
                    চেকআউট করুন
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
