"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getVariantTypeLabel } from "@/lib/productVariants";
import {
  Banknote,
  ChevronDown,
  Lock,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import { useProducts } from "@/hooks/useProducts";
import { createOrder } from "@/lib/api/orders";
import { getMaxLineQuantity } from "@/lib/cart";
import {
  DELIVERY_OPTIONS,
  normalizePhone,
  validateCustomerDetails,
} from "@/lib/orderValidation";
import { getProductVariantConfig } from "@/lib/productVariants";
import { getProductCardImageUrl } from "@/lib/imageUrl";
import { buildCartPixelPayload, trackMetaEvent } from "@/lib/metaPixel";

const DELIVERY_LIST = [
  { id: "inside_dhaka", ...DELIVERY_OPTIONS.inside_dhaka },
  { id: "outside_dhaka", ...DELIVERY_OPTIONS.outside_dhaka },
];

const fieldLabelClass =
  "mb-2 block text-base font-bold text-zinc-900 sm:mb-1.5 sm:text-sm sm:font-semibold sm:text-zinc-800";

const inputClass =
  "w-full rounded-lg border bg-white px-4 py-3.5 text-base text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:ring-2 sm:rounded-md sm:px-3.5 sm:py-3 sm:text-sm";

function fieldClass(hasError) {
  return hasError
    ? `${inputClass} border-rose-300 focus:border-rose-400 focus:ring-rose-100`
    : `${inputClass} border-zinc-200 focus:border-indigo-400 focus:ring-indigo-100`;
}

function getItemVariantOptions(item, products) {
  if (item.variant_options?.length) return item.variant_options;

  const product = products.find((entry) => entry._id === item._id);
  if (!product) {
    return item.selected_variant ? [item.selected_variant] : [];
  }

  return getProductVariantConfig(product).options;
}

function CheckoutItemCard({ item, items, products, onUpdateQty, onUpdateVariant, onRemove }) {
  const variantOptions = getItemVariantOptions(item, products);
  const hasVariants = variantOptions.length > 0;
  const variantLabel = item.variant_label || getVariantTypeLabel({ variant_type: item.variant_type }, "bn");
  const discount =
    item.regular_price > item.price
      ? Math.round(((item.regular_price - item.price) / item.regular_price) * 100)
      : 0;
  const lineTotal = item.price * item.quantity;
  const imageSrc = getProductCardImageUrl(item.image);

  return (
    <article className="overflow-hidden rounded-xl border border-zinc-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
      <div className="flex gap-3.5 p-3.5 sm:gap-4 sm:p-4">
        <div className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50 sm:h-20 sm:w-20">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={item.title}
              fill
              unoptimized
              className="object-cover object-center"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-300">
              <Package className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-sm font-bold leading-snug text-zinc-900">
                {item.title}
              </h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="text-base font-bold text-zinc-900">
                  ৳{item.price.toLocaleString()}
                </span>
                {item.regular_price > item.price ? (
                  <>
                    <span className="text-xs text-zinc-400 line-through">
                      ৳{item.regular_price.toLocaleString()}
                    </span>
                    {discount > 0 ? (
                      <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        -{discount}%
                      </span>
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              aria-label="আইটেম সরান"
              onClick={() => onRemove(item)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-end gap-2.5 sm:gap-3">
            {hasVariants ? (
              <div className="min-w-0 flex-1 sm:min-w-[120px]">
                <label className="mb-1 block text-[10px] font-semibold tracking-wide text-zinc-500 uppercase">
                  {variantLabel}
                </label>
                <div className="relative">
                  <select
                    value={item.selected_variant || variantOptions[0] || ""}
                    onChange={(event) => onUpdateVariant(item, event.target.value)}
                    className="h-9 w-full appearance-none rounded-lg border border-zinc-200 bg-zinc-50 py-0 pl-3 pr-8 text-sm font-medium text-zinc-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  >
                    {variantOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                </div>
              </div>
            ) : null}

            <div className={hasVariants ? "" : "flex-1"}>
              <label className="mb-1 block text-[10px] font-semibold tracking-wide text-zinc-500 uppercase">
                পরিমাণ
              </label>
              <div className="inline-flex h-9 items-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                <button
                  type="button"
                  aria-label="পরিমাণ কমান"
                  onClick={() => onUpdateQty(item, item.quantity - 1)}
                  className="flex h-9 w-9 items-center justify-center text-zinc-600 transition-colors hover:bg-white"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-[2rem] border-x border-zinc-200 bg-white px-2 text-center text-sm font-bold text-zinc-900">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  aria-label="পরিমাণ বাড়ান"
                  onClick={() => onUpdateQty(item, item.quantity + 1)}
                  disabled={item.quantity >= getMaxLineQuantity(item, items)}
                  className="flex h-9 w-9 items-center justify-center text-zinc-600 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-100 bg-indigo-50/50 px-3.5 py-2.5 sm:px-4">
        <span className="text-xs text-zinc-600">
          {item.quantity} × ৳{item.price.toLocaleString()}
        </span>
        <span className="text-sm font-bold text-indigo-700">
          মোট ৳{lineTotal.toLocaleString()}
        </span>
      </div>
    </article>
  );
}

export default function CheckoutView() {
  const router = useRouter();
  const { items, updateQuantity, updateVariant, removeFromCart, clearCart } = useCart();
  const { data: products = [] } = useProducts();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [delivery, setDelivery] = useState("outside_dhaka");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const totalDiscount = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + Math.max(0, (item.regular_price - item.price) * item.quantity),
        0
      ),
    [items]
  );

  const deliveryCharge =
    DELIVERY_LIST.find((option) => option.id === delivery)?.charge ?? 0;
  const payable = subtotal + deliveryCharge;
  const initiateCheckoutTracked = useRef(false);

  useEffect(() => {
    if (!items.length || initiateCheckoutTracked.current) return;
    initiateCheckoutTracked.current = true;
    trackMetaEvent("InitiateCheckout", buildCartPixelPayload(items, payable));
  }, [items, payable]);

  function clearFieldError(field) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleUpdateQty(item, quantity) {
    if (quantity > getMaxLineQuantity(item, items)) {
      toast.error(`সর্বোচ্চ ${getMaxLineQuantity(item, items)}টি রাখতে পারবেন`);
      return;
    }
    updateQuantity(item._id, quantity, item.title, item.selected_variant);
  }

  function handleUpdateVariant(item, newVariant) {
    updateVariant(item._id, item.selected_variant, newVariant, item.title);
  }

  function handleRemove(item) {
    removeFromCart(item._id, item.title, item.selected_variant);
  }

  async function handleConfirm(event) {
    event.preventDefault();

    const validation = validateCustomerDetails({ name, phone, address });
    if (!validation.ok) {
      setFieldErrors(validation.errors);
      toast.error(Object.values(validation.errors)[0]);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      const order = await createOrder({
        name: validation.values.name,
        phone: validation.values.phone,
        address: validation.values.address,
        delivery,
        items: items.map((item) => ({
          _id: item._id,
          title: item.title,
          quantity: item.quantity,
          selected_variant: item.selected_variant || "",
        })),
      });

      clearCart();
      sessionStorage.setItem(
        "nexa_last_order",
        JSON.stringify({
          order_number: order.order_number,
          phone: validation.values.phone,
          total: order.pricing?.total,
          currency: order.pricing?.currency || "BDT",
          items: (order.items || []).map((item) => ({
            id: item.product_id || item.slug,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
          })),
        })
      );

      router.push("/thankyou");
      clearCart();
      toast.success("অর্ডার সফলভাবে গ্রহণ করা হয়েছে!");
    } catch (error) {
      toast.error(error.message || "অর্ডার প্লেস করা যায়নি");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-md border border-dashed border-zinc-200 bg-white p-6 text-center sm:p-10">
        <ShoppingBag className="mx-auto h-10 w-10 text-zinc-300" />
        <p className="mt-4 text-sm text-zinc-500">আপনার কার্ট খালি।</p>
        <Link href="/products" className="mt-4 inline-block text-sm font-semibold text-indigo-600">
          পণ্য দেখুন
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl min-w-0">
      <header className="mx-auto max-w-2xl text-center lg:max-w-3xl">
        <h1 className="text-2xl font-bold leading-snug text-zinc-900 sm:text-3xl">
          অর্ডারটি কনফার্ম করুন
        </h1>
        <p className="mt-2.5 text-base leading-relaxed text-zinc-500 sm:mt-3 sm:text-lg">
          আপনার নাম, ঠিকানা এবং ফোন নাম্বার দিন
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-10">
        {/* Left — customer form */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm sm:p-5 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
          <form onSubmit={handleConfirm} className="space-y-5 sm:space-y-4">
            <div>
              <label htmlFor="checkout-name" className={fieldLabelClass}>
                আপনার নাম
              </label>
              <input
                id="checkout-name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  clearFieldError("name");
                }}
                placeholder="পূর্ণ নাম লিখুন"
                className={fieldClass(fieldErrors.name)}
              />
              {fieldErrors.name ? (
                <p className="mt-1 text-xs text-rose-500">{fieldErrors.name}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="checkout-phone" className={fieldLabelClass}>
                ফোন নাম্বার
              </label>
              <input
                id="checkout-phone"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(event) => {
                  setPhone(normalizePhone(event.target.value));
                  clearFieldError("phone");
                }}
                placeholder="01XXXXXXXXX"
                className={fieldClass(fieldErrors.phone)}
              />
              {fieldErrors.phone ? (
                <p className="mt-1 text-xs text-rose-500">{fieldErrors.phone}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="checkout-address" className={fieldLabelClass}>
                আপনার ঠিকানা
              </label>
              <textarea
                id="checkout-address"
                rows={4}
                value={address}
                onChange={(event) => {
                  setAddress(event.target.value);
                  clearFieldError("address");
                }}
                placeholder="বাড়ি/রোড, এলাকা, জেলা — সম্পূর্ণ ঠিকানা"
                className={`${fieldClass(fieldErrors.address)} resize-none`}
              />
              {fieldErrors.address ? (
                <p className="mt-1 text-xs text-rose-500">{fieldErrors.address}</p>
              ) : null}
            </div>

            <div className="border-t border-zinc-100 pt-5 sm:pt-4">
              <p className={fieldLabelClass}>ডেলিভারি এরিয়া</p>
              <div className="space-y-2.5">
                {DELIVERY_LIST.map((option) => (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3.5 transition-colors sm:rounded-md sm:px-3.5 sm:py-3 ${
                      delivery === option.id
                        ? "border-indigo-400 bg-indigo-50 ring-1 ring-indigo-100"
                        : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value={option.id}
                      checked={delivery === option.id}
                      onChange={() => setDelivery(option.id)}
                      className="h-4 w-4 shrink-0 accent-indigo-600 sm:h-4 sm:w-4"
                    />
                    <span className="min-w-0 text-base font-medium text-zinc-800 sm:text-sm">
                      {option.label} — ৳{option.charge}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-5 sm:pt-4">
              <p className={fieldLabelClass}>পেমেন্ট পদ্বতি</p>
              <div
                aria-disabled="true"
                className="flex cursor-not-allowed items-center gap-3 rounded-lg border-2 border-indigo-200 bg-indigo-50/80 px-4 py-4 opacity-95 sm:rounded-md sm:py-3.5"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[5px] border-indigo-600 bg-white" />
                <Banknote className="h-5 w-5 text-indigo-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold text-zinc-900 sm:text-sm">Cash On Delivery</p>
                  <p className="mt-0.5 text-sm text-zinc-500 sm:text-xs">
                    প্রডাক্ট হাতে পেয়ে টাকা পরিশোধ করুন
                  </p>
                </div>
                <Lock className="h-4 w-4 shrink-0 text-zinc-400" title="একমাত্র পেমেন্ট অপশন" />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="animate-checkout-confirm-shake w-full rounded-lg bg-rose-600 py-5 text-lg font-extrabold tracking-wide text-white shadow-[0_8px_24px_-6px_rgba(225,29,72,0.55)] transition-colors hover:bg-rose-700 active:scale-[0.98] disabled:animate-none disabled:opacity-60 lg:hidden"
            >
              {submitting ? "প্রসেস হচ্ছে..." : "অর্ডার কনফার্ম করুন"}
            </button>
          </form>
        </div>

        {/* Right — order summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-xl font-bold text-zinc-900 sm:text-lg">আপনার অর্ডার</h2>

          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <CheckoutItemCard
                key={`${item._id}-${item.selected_variant || "default"}`}
                item={item}
                items={items}
                products={products}
                onUpdateQty={handleUpdateQty}
                onUpdateVariant={handleUpdateVariant}
                onRemove={handleRemove}
              />
            ))}
          </div>

          <div className="mt-5 rounded-md border border-zinc-200 bg-white p-4 text-sm">
            <div className="space-y-2 border-b border-zinc-100 pb-3">
              <div className="flex justify-between text-zinc-600">
                <span>সর্বমোট</span>
                <span className="font-semibold text-zinc-900">৳{subtotal.toLocaleString()}</span>
              </div>
              {totalDiscount > 0 ? (
                <div className="flex justify-between text-emerald-600">
                  <span>ডিসকাউন্ট পাচ্ছেন</span>
                  <span className="font-semibold">-৳{totalDiscount.toLocaleString()}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-zinc-600">
                <span>ডেলিভারি চার্জ</span>
                <span className="font-semibold text-zinc-900">৳{deliveryCharge.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-between pt-3">
              <span className="font-bold text-zinc-900">পরিশোধ করতে হবে</span>
              <span className="text-lg font-bold text-indigo-600">৳{payable.toLocaleString()}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={handleConfirm}
            className="mt-4 hidden w-full rounded-md bg-indigo-600 py-3.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60 lg:block"
          >
            {submitting ? "প্রসেস হচ্ছে..." : "অর্ডার কনফার্ম করুন"}
          </button>
        </div>
      </div>
    </div>
  );
}
