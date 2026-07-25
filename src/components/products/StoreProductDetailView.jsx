"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Minus,
  Package,
  Phone,
  Plus,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  Zap,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import { getProductMaxStock } from "@/lib/cart";
import { getProductVariantConfig } from "@/lib/productVariants";
import { isVariableProduct, resolveProductPricing } from "@/lib/productPricing";
import { isProductFullyOutOfStock, isVariantOutOfStock } from "@/lib/variantStock";
import StoreProductCard from "@/components/products/StoreProductCard";
import { useStoreSettings } from "@/components/providers/SiteSettingsProvider";
import { buildProductPixelPayload, trackMetaEvent } from "@/lib/metaPixel";

function RatingStars({ rating }) {
  const value = Math.min(5, Math.max(0, rating || 0));

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index < Math.round(value) ? "fill-amber-400 text-amber-400" : "text-zinc-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function StoreProductDetailView({ product, relatedProducts = [] }) {
  const settings = useStoreSettings();
  const CONTACT_PHONE = settings.contactPhone || "+8801815131040";
  const whatsappPhone = CONTACT_PHONE.replace(/\+/g, "").trim();
  const WHATSAPP_URL = `https://wa.me/${whatsappPhone}`;
  const router = useRouter();
  const { addToCart, buyNow, removeFromCart, items } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState("");

  const variantConfig = useMemo(() => getProductVariantConfig(product), [product]);
  const productCartLines = useMemo(
    () => items.filter((item) => item._id === product._id),
    [items, product._id]
  );
  const images = product.images?.length ? product.images : [];
  const title = product.title_bn || product.title_en;
  const activePricing = useMemo(
    () => resolveProductPricing(product, selectedVariant),
    [product, selectedVariant]
  );
  const salePrice = activePricing.sale_price || 0;
  const regularPrice = activePricing.regular_price || 0;
  const discount = activePricing.discount_percentage || 0;
  const showFromPrice = isVariableProduct(product) && !selectedVariant;
  const outOfStock = variantConfig.required
    ? selectedVariant
      ? isVariantOutOfStock(product, selectedVariant)
      : isProductFullyOutOfStock(product)
    : isVariantOutOfStock(product);
  const maxStock = getProductMaxStock(product, selectedVariant);
  const totalCartQty = items
    .filter((item) => item._id === product._id)
    .reduce((sum, item) => sum + item.quantity, 0);
  const cartLine = items.find(
    (item) =>
      item._id === product._id && (item.selected_variant || "") === (selectedVariant || "")
  );
  const inCart = Boolean(cartLine);
  const cartQty = cartLine?.quantity || 0;
  const remainingStock = Math.max(0, maxStock - cartQty);
  const hasAnyInCart = productCartLines.length > 0;

  const savings = useMemo(() => {
    if (regularPrice <= salePrice) return 0;
    return (regularPrice - salePrice) * quantity;
  }, [regularPrice, salePrice, quantity]);

  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant]);

  useEffect(() => {
    setQuantity((current) => {
      const limit = Math.max(1, remainingStock || 1);
      return Math.min(limit, Math.max(1, current));
    });
  }, [remainingStock]);

  useEffect(() => {
    if (productCartLines.length === 0) return;

    if (variantConfig.required && !selectedVariant) {
      const variantInCart = productCartLines[0]?.selected_variant;
      if (variantInCart) setSelectedVariant(variantInCart);
    }
  }, [productCartLines, variantConfig.required, selectedVariant]);

  useEffect(() => {
    if (inCart) {
      setQuantity(cartQty);
    } else if (!variantConfig.required && productCartLines.length === 0) {
      setQuantity(1);
    }
  }, [selectedVariant, inCart, cartQty, variantConfig.required, productCartLines.length]);

  useEffect(() => {
    trackMetaEvent("ViewContent", buildProductPixelPayload(product, 1));
  }, [product._id]);

  function clampQty(value) {
    const limit = Math.max(1, remainingStock || 1);
    return Math.min(limit, Math.max(1, value));
  }

  function handleAddToCart() {
    if (outOfStock) {
      toast.error("এই পণ্যটি স্টকে নেই");
      return;
    }
    if (variantConfig.required && !selectedVariant) {
      toast.error(`অনুগ্রহ করে ${variantConfig.label} বেছে নিন`);
      return;
    }
    if (inCart) {
      removeFromCart(product._id, title, selectedVariant);
      return;
    }
    if (remainingStock === 0) {
      toast.error("স্টক অনুযায়ী আর যোগ করা যাবে না");
      return;
    }
    addToCart(product, quantity, selectedVariant);
    trackMetaEvent("AddToCart", buildProductPixelPayload(product, quantity));
  }

  function handleBuy() {
    if (outOfStock) {
      toast.error("এই পণ্যটি স্টকে নেই");
      return;
    }
    if (variantConfig.required && !selectedVariant) {
      toast.error(`অনুগ্রহ করে ${variantConfig.label} বেছে নিন`);
      return;
    }
    if (inCart) {
      router.push("/checkout");
      return;
    }
    if (remainingStock === 0) {
      toast.error("স্টক অনুযায়ী আর যোগ করা যাবে না");
      return;
    }
    buyNow(product, quantity, selectedVariant);
    trackMetaEvent("AddToCart", buildProductPixelPayload(product, quantity));
  }

  function increaseQuantity() {
    if (remainingStock === 0) {
      toast.error("স্টক অনুযায়ী আর যোগ করা যাবে না");
      return;
    }
    if (quantity >= remainingStock) {
      toast.error(`সর্বোচ্চ ${remainingStock}টি যোগ করতে পারবেন`);
      return;
    }
    setQuantity((q) => clampQty(q + 1));
  }

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareText = `${title} — ৳${salePrice.toLocaleString()} | Raisa's Glam Nest`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url });
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("পণ্যের লিংক কপি হয়েছে");
    } catch {
      toast.error("শেয়ার করা যায়নি");
    }
  }

  return (
    <div className="store-container py-6 sm:py-10">
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 sm:text-sm">
        <Link href="/" className="transition-colors hover:text-indigo-600">
          হোম
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <Link href="/products" className="transition-colors hover:text-indigo-600">
          পণ্য
        </Link>
        {product.category ? (
          <>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <Link
              href={`/products?category=${product.category_slug || ""}`}
              className="transition-colors hover:text-indigo-600"
            >
              {product.category}
            </Link>
          </>
        ) : null}
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="line-clamp-1 font-medium text-zinc-800">{title}</span>
      </nav>
      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start xl:top-28">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="space-y-4"
          >
          <div className="relative overflow-hidden rounded-md border border-zinc-200 bg-white">
            <div className="relative aspect-square bg-zinc-50 p-4 sm:p-6">
              {images[activeImage]?.url ? (
                <Image
                  src={images[activeImage].url}
                  alt={title}
                  fill
                  unoptimized
                  priority
                  className="object-contain object-center"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-300">
                  <Package className="h-16 w-16" />
                </div>
              )}
            </div>

            {discount > 0 ? (
              <span className="absolute top-4 left-4 rounded-md bg-rose-500 px-2.5 py-1 text-xs font-bold text-white">
                -{discount}% ছাড়
              </span>
            ) : null}

            {outOfStock ? (
              <span
                className={`absolute left-4 rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-white ${
                  discount > 0 ? "top-14" : "top-4"
                }`}
              >
                স্টক নেই
              </span>
            ) : null}

            <button
              type="button"
              aria-label="শেয়ার করুন"
              onClick={handleShare}
              className="absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 bg-white/95 text-zinc-700 shadow-sm transition-colors hover:border-indigo-200 hover:text-indigo-600"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          {images.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((image, index) => (
                <button
                  key={image.fileId || image.url || index}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-white transition-all sm:h-20 sm:w-20 ${
                    activeImage === index
                      ? "border-indigo-500 ring-2 ring-indigo-100"
                      : "border-zinc-200 hover:border-indigo-200"
                  }`}
                >
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    unoptimized
                    className="object-contain p-1"
                  />
                </button>
              ))}
            </div>
          ) : null}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="flex flex-col"
        >
          <div className="flex flex-wrap items-center gap-2">
            {product.category ? (
              <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                {product.category}
              </span>
            ) : null}
            {/* {product.brand_or_vendor ? (
              <span className="text-xs font-medium text-zinc-500">{product.brand_or_vendor}</span>
            ) : null} */}
          </div>

          <h1 className="mt-3 text-xl font-bold leading-snug text-zinc-900 sm:text-2xl lg:text-3xl">{title}</h1>

          {product.ratings?.average_rating > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <RatingStars rating={product.ratings.average_rating} />
              <span className="text-sm font-semibold text-zinc-800">
                {product.ratings.average_rating}
              </span>
              <span className="text-sm text-zinc-400">
                ({product.ratings.total_reviews} রিভিউ)
              </span>
            </div>
          ) : null}

          <div className="mt-4.5 rounded-md">
            <div className="flex flex-wrap items-end gap-3">
              {showFromPrice ? (
                <span className="pb-1 text-sm font-semibold text-indigo-600"></span>
              ) : null}
              <p className="text-2xl font-bold text-zinc-900 sm:text-3xl lg:text-4xl">
                ৳{salePrice.toLocaleString()}
              </p>
              {regularPrice > salePrice ? (
                <p className="pb-1 text-base text-zinc-400 line-through sm:text-lg">
                  ৳{regularPrice.toLocaleString()}
                </p>
              ) : null}
            </div>

            {/* {savings > 0 ? (
              <p className="mt-2 text-sm font-medium text-emerald-600">
                আপনি ৳{savings.toLocaleString()} সাশ্রয় করছেন
              </p>
            ) : null} */}

            {/* <p className="mt-3 text-xs text-zinc-500">
              {outOfStock
                ? "এই পণ্যটি বর্তমানে স্টকে নেই"
                : maxStock > 0
                  ? `স্টকে ${maxStock}টি আছে${inCart ? ` · কার্টে ${cartQty}টি` : ""}`
                  : "স্টকে আছে"}
            </p> */}
            {!outOfStock && inCart && remainingStock === 0 ? (
              <p className="mt-1 text-xs font-medium text-amber-600">
                স্টক অনুযায়ী আর যোগ করা যাবে না
              </p>
            ) : null}
          </div>

          {/* {hasAnyInCart ? (
            <div className="mt-4 break-words rounded-md border border-indigo-200 bg-indigo-50  text-xs font-medium text-indigo-800">
              <span className="font-semibold">কার্টে আছে:</span>{" "}
              {variantConfig.required
                ? productCartLines
                    .map((line) =>
                      line.selected_variant
                        ? `${line.selected_variant} × ${line.quantity}`
                        : `${line.quantity}টি`
                    )
                    .join(" · ")
                : `${totalCartQty}টি`}
            </div>
          ) : null} */}

          {variantConfig.required ? (
            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold text-zinc-700">
                {variantConfig.label} বেছে নিন <span className="text-rose-500">*</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {variantConfig.options.map((option) => {
                  const optionOutOfStock = isVariantOutOfStock(product, option);
                  return (
                  <button
                    key={option}
                    type="button"
                    disabled={optionOutOfStock}
                    onClick={() => {
                      setSelectedVariant(option);
                    }}
                    className={`rounded-md border px-3.5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      selectedVariant === option
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : optionOutOfStock
                          ? "border-zinc-200 bg-zinc-100 text-zinc-400"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-indigo-200 hover:text-indigo-700"
                    }`}
                  >
                    {option}
                    {optionOutOfStock ? " (স্টক নেই)" : ""}
                  </button>
                );
                })}
              </div>
            </div>
          ) : null}

          {!outOfStock ? (
            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold text-zinc-700">
                পরিমাণ
              </p>
              <div className="inline-flex items-center rounded-md border border-zinc-200 bg-white">
                <button
                  type="button"
                  aria-label="পরিমাণ কমান"
                  onClick={() => setQuantity((q) => clampQty(q - 1))}
                  className="flex h-11 w-11 items-center justify-center text-zinc-600 transition-colors hover:bg-zinc-50"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-[3rem] text-center text-base font-bold text-zinc-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="পরিমাণ বাড়ান"
                  onClick={increaseQuantity}
                  className="flex h-11 w-11 items-center justify-center text-zinc-600 transition-colors hover:bg-zinc-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : null}


          

          <div className="mt-6 grid grid-cols-[2.75rem_1fr] gap-2 sm:grid-cols-2 sm:gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              aria-label={
                inCart ? `কার্টে (${cartQty}) — সরান` : "কার্টে যোগ করুন"
              }
              title={inCart ? `কার্টে (${cartQty}) — সরান` : "কার্টে যোগ করুন"}
              className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors sm:h-auto sm:px-5 sm:py-3.5 ${
                inCart
                  ? "border border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700"
                  : "border border-zinc-200 bg-white text-zinc-800 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
              }`}
            >
              {inCart ? <Check className="h-4 w-4 shrink-0" /> : <ShoppingCart className="h-4 w-4 shrink-0" />}
              <span className="hidden truncate sm:inline">
                {inCart ? `কার্টে (${cartQty}) — সরান` : "কার্টে যোগ করুন"}
              </span>
            </button>
            <motion.button
              type="button"
              onClick={handleBuy}
              animate={{ scale: [1, 1.02, 1] }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{
                scale: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
              }}
              className="relative inline-flex h-11 min-w-0 items-center justify-center gap-2 overflow-hidden rounded-md bg-indigo-600 px-3 text-sm font-semibold text-white shadow-[0_4px_14px_-4px_rgba(79,70,229,0.55)] transition-colors hover:bg-indigo-700 sm:h-auto sm:px-5 sm:py-3.5"
            >
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                animate={{ x: ["-120%", "120%"] }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  repeatDelay: 1.2,
                  ease: "easeInOut",
                }}
              />
              <Zap className="relative h-4 w-4 shrink-0" />
              <span className="relative truncate">
                {inCart ? "চেকআউটে যান" : "এখনই কিনুন"}
              </span>
            </motion.button>
          </div>

          
          <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-md border border-emerald-600 bg-emerald-500 px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600 sm:text-sm"
            >
              <FaWhatsapp className="h-4 w-4 shrink-0" />
              <span className="truncate">হোয়াটসঅ্যাপ</span>
            </a>
            <a
              href={`tel:${CONTACT_PHONE}`}
              className="flex items-center justify-center gap-2 rounded-md border border-sky-600 bg-sky-500 px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-sky-600 sm:text-sm"
            >
              <Phone className="h-4 w-4 shrink-0" />
              <span className="truncate">{CONTACT_PHONE}</span>
            </a>
          </div>

          {/* <button
            type="button"
            onClick={handleShare}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 sm:w-auto"
          >
            <Share2 className="h-4 w-4" />
            শেয়ার করুন
          </button> */}

          <div>

          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Truck, label: "দ্রুত ডেলিভারি" },
              { icon: ShieldCheck, label: "নিরাপদ কেনাকাটা" },
              { icon: Package, label: "মানসম্মত পণ্য" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-md border border-zinc-100 bg-white px-3 py-2.5"
              >
                <Icon className="h-4 w-4 shrink-0 text-indigo-600" />
                <span className="text-xs font-medium text-zinc-600">{label}</span>
              </div>
            ))}
          </div>

          {(variantConfig.required || product.attributes?.material) && (
            <div className="mt-8 rounded-md border border-zinc-200 bg-white p-4 sm:p-5">
              <h2 className="text-sm font-bold text-zinc-900">বিস্তারিত তথ্য</h2>
              <dl className="mt-3 space-y-2 text-sm">
                {variantConfig.required ? (
                  <div className="flex justify-between gap-4 border-b border-zinc-100 pb-2">
                    <dt className="text-zinc-500">{variantConfig.label}</dt>
                    <dd className="font-medium text-zinc-800">
                      {variantConfig.options.join(", ")}
                    </dd>
                  </div>
                ) : null}
                {product.attributes?.material ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-zinc-500">ম্যাটেরিয়াল</dt>
                    <dd className="font-medium text-zinc-800">{product.attributes.material}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          )}

          {product.description ? (
            <div className="mt-6 rounded-md border border-zinc-200 bg-white p-4 sm:p-5">
              <h2 className="text-sm font-bold text-zinc-900">পণ্যের বিবরণ</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-600">
                {product.description}
              </p>
            </div>
          ) : null}
        </motion.div>
      </div>

      {product.category ? (
        <section className="mt-14 border-t border-zinc-200 pt-10 sm:mt-16">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-indigo-600">একই ক্যাটাগরি</p>
              <h2 className="mt-1 line-clamp-2 text-lg font-bold text-zinc-900 sm:text-xl lg:text-2xl">
                {product.category} — আরও পণ্য
              </h2>
            </div>
            {product.category_slug ? (
              <Link
                href={`/products?category=${product.category_slug}`}
                className="shrink-0 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                সব দেখুন
              </Link>
            ) : (
              <Link
                href="/products"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                সব পণ্য
              </Link>
            )}
          </div>

          {relatedProducts.length > 0 ? (
            <div className="store-product-grid">
              {relatedProducts.map((item, index) => (
                <StoreProductCard key={item._id} product={item} index={index} />
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-zinc-200 bg-white px-6 py-10 text-center">
              <p className="text-sm text-zinc-500">এই ক্যাটাগরিতে আর কোনো পণ্য নেই।</p>
              <Link
                href="/products"
                className="mt-3 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                সব পণ্য দেখুন
              </Link>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
