"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
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

const DELIVERY_LIST = [
  { id: "inside_dhaka", ...DELIVERY_OPTIONS.inside_dhaka },
  { id: "outside_dhaka", ...DELIVERY_OPTIONS.outside_dhaka },
];

const inputClass =
  "w-full rounded-md border bg-white px-3.5 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:ring-2";

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
  const variantLabel = item.variant_type === "weight" ? "ওজন" : "সাইজ";
  const discount =
    item.regular_price > item.price
      ? Math.round(((item.regular_price - item.price) / item.regular_price) * 100)
      : 0;
  const lineTotal = item.price * item.quantity;
  const maxQty = getMaxLineQuantity(item, items);

  return (
    <div className="relative rounded-md border border-zinc-200 bg-zinc-50/80 p-3 sm:p-4">
      <button
        type="button"
        aria-label="আইটেম সরান"
        onClick={() => onRemove(item)}
        className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-md text-rose-500 transition-colors hover:bg-rose-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <div className="flex gap-3 pr-8">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-white sm:h-24 sm:w-24">
          {item.image ? (
            <Image src={item.image} alt={item.title} fill unoptimized className="object-contain p-1.5" />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-300">
              <Package className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900">{item.title}</p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-base font-bold text-zinc-900">৳{item.price.toLocaleString()}</span>
            {item.regular_price > item.price ? (
              <>
                <span className="text-xs text-zinc-400 line-through">
                  ৳{item.regular_price.toLocaleString()}
                </span>
                {discount > 0 ? (
                  <span className="rounded-md bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {discount}% OFF
                  </span>
                ) : null}
              </>
            ) : null}
          </div>

          <p className="mt-1 text-xs font-semibold text-indigo-600">৳{lineTotal.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {hasVariants ? (
          <div className="relative min-w-[120px] flex-1">
            <label className="sr-only">{variantLabel}</label>
            <select
              value={item.selected_variant || variantOptions[0] || ""}
              onChange={(event) =>
                onUpdateVariant(item, event.target.value)
              }
              className="w-full appearance-none rounded-md border border-zinc-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-zinc-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              {variantOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          </div>
        ) : null}

        <div className="inline-flex items-center rounded-md border border-zinc-200 bg-white">
          <button
            type="button"
            aria-label="পরিমাণ কমান"
            onClick={() => onUpdateQty(item, item.quantity - 1)}
            className="flex h-9 w-9 items-center justify-center text-zinc-600 hover:bg-zinc-50"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-[2.5rem] text-center text-sm font-bold text-zinc-900">
            {item.quantity}
          </span>
          <button
            type="button"
            aria-label="পরিমাণ বাড়ান"
            onClick={() => onUpdateQty(item, item.quantity + 1)}
            className="flex h-9 w-9 items-center justify-center text-zinc-600 hover:bg-zinc-50"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
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
        })
      );

      toast.success("অর্ডার সফলভাবে গ্রহণ করা হয়েছে!");
      router.push("/thankyou");
    } catch (error) {
      toast.error(error.message || "অর্ডার প্লেস করা যায়নি");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-md border border-dashed border-zinc-200 bg-white p-10 text-center">
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
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        {/* Left — customer form */}
        <div>
          <p className="text-sm leading-relaxed text-zinc-600">
            অর্ডারটি কনফার্ম করতে আপনার নাম, ঠিকানা, এবং ফোন নাম্বার দিন।
            পণ্য হাতে পেয়ে তারপরই টাকা দিন —{" "}
            <span className="font-semibold text-zinc-800">Cash on Delivery</span>।
          </p>

          <form onSubmit={handleConfirm} className="mt-6 space-y-4">
            <div>
              <label htmlFor="checkout-name" className="mb-1.5 block text-sm font-semibold text-zinc-800">
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
              <label htmlFor="checkout-phone" className="mb-1.5 block text-sm font-semibold text-zinc-800">
                ফোন নাম্বার
              </label>
              <div
                className={`flex overflow-hidden rounded-md border bg-white focus-within:ring-2 ${
                  fieldErrors.phone
                    ? "border-rose-300 focus-within:border-rose-400 focus-within:ring-rose-100"
                    : "border-zinc-200 focus-within:border-indigo-400 focus-within:ring-indigo-100"
                }`}
              >
                <span className="flex items-center border-r border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold text-zinc-500">
                  (BD) +88
                </span>
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
                  className="min-w-0 flex-1 px-3.5 py-3 text-sm outline-none placeholder:text-zinc-400"
                />
              </div>
              {fieldErrors.phone ? (
                <p className="mt-1 text-xs text-rose-500">{fieldErrors.phone}</p>
              ) : (
                <p className="mt-1 text-[11px] text-zinc-400">১১ ডিজিটের বাংলাদেশি নাম্বার (01XXXXXXXXX)</p>
              )}
            </div>

            <div>
              <label htmlFor="checkout-address" className="mb-1.5 block text-sm font-semibold text-zinc-800">
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

            <div>
              <p className="mb-2 text-sm font-semibold text-zinc-800">আপনি কিভাবে পরিশোধ করতে চান</p>
              <div
                aria-disabled="true"
                className="flex cursor-not-allowed items-center gap-3 rounded-md border-2 border-indigo-200 bg-indigo-50/80 px-4 py-3.5 opacity-90"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[5px] border-indigo-600 bg-white" />
                <Banknote className="h-5 w-5 text-indigo-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-zinc-900">Cash On Delivery</p>
                  <p className="text-xs text-zinc-500">ডেলিভারির সময় নগদ পরিশোধ</p>
                </div>
                <Lock className="h-4 w-4 shrink-0 text-zinc-400" title="একমাত্র পেমেন্ট অপশন" />
              </div>
              <p className="mt-1.5 text-[11px] text-zinc-400">
                অনলাইন পেমেন্ট এখনো চালু নয় — শুধু COD
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-indigo-600 py-3.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60 lg:hidden"
            >
              {submitting ? "প্রসেস হচ্ছে..." : "অর্ডার কনফার্ম করুন"}
            </button>
          </form>
        </div>

        {/* Right — order summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-lg font-bold text-zinc-900">আপনার অর্ডার</h2>

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

          <div className="mt-5 rounded-md border border-zinc-200 bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-zinc-800">ডেলিভারি মেথড নির্বাচন করুন</p>
            <div className="space-y-2">
              {DELIVERY_LIST.map((option) => (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-md border px-3.5 py-3 transition-colors ${
                    delivery === option.id
                      ? "border-indigo-300 bg-indigo-50/60"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value={option.id}
                    checked={delivery === option.id}
                    onChange={() => setDelivery(option.id)}
                    className="h-4 w-4 accent-indigo-600"
                  />
                  <span className="text-sm font-medium text-zinc-800">
                    {option.label} — ৳{option.charge}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-md border border-zinc-200 bg-white p-4 text-sm">
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
