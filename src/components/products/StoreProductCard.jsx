"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Check, Package, ShoppingCart, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import { resolveProductVariant } from "@/lib/productVariants";
import { getProductCardImageUrl } from "@/lib/imageUrl";

export default function StoreProductCard({ product, index = 0 }) {
  const { toggleCart, buyNow, items } = useCart();
  const defaultVariant = resolveProductVariant(product);
  const image = getProductCardImageUrl(product.images?.[0]?.url);
  const discount = product.pricing?.discount_percentage || 0;
  const title = product.title_bn || product.title_en;
  const salePrice = product.pricing?.sale_price;
  const regularPrice = product.pricing?.regular_price;
  const outOfStock = product.inventory?.stock_status === "out_of_stock";
  const inCart = items.some(
    (item) =>
      item._id === product._id &&
      (item.selected_variant || "") === (defaultVariant || "")
  );

  function handleCartToggle(event) {
    event.preventDefault();
    event.stopPropagation();
    if (outOfStock) {
      toast.error("এই পণ্যটি স্টকে নেই");
      return;
    }
    toggleCart(product);
  }

  function handleBuy(event) {
    event.preventDefault();
    event.stopPropagation();
    if (outOfStock) {
      toast.error("এই পণ্যটি স্টকে নেই");
      return;
    }
    buyNow(product, 1, defaultVariant);
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-md border border-zinc-200/90 bg-white transition-all duration-200 hover:border-zinc-300 hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.18)]"
    >
      <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-zinc-50">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              unoptimized
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.04] [transform:translateZ(0)]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-300">
              <Package className="h-8 w-8" />
            </div>
          )}

          {discount > 0 ? (
            <span className="absolute top-2 left-2 z-10 rounded-md bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              -{discount}%
            </span>
          ) : null}

          {outOfStock ? (
            <span className="absolute top-2 right-2 z-10 rounded-md bg-zinc-800/90 px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm">
              স্টক নেই
            </span>
          ) : null}
        </div>

        <div className="px-2 pt-2 sm:px-2.5 sm:pt-3.5">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-800 sm:text-base md:text-lg">
            {title}
          </h3>

          <div className="mt-1 flex flex-wrap items-baseline gap-1.5 pb-2 sm:mt-1.5 sm:gap-2 sm:pb-2.5">
            <span className="text-[16px] md:text-xl font-bold text-red-600 min-[360px]:text-sm sm:text-base">
              ৳<span className="font-sans">{salePrice?.toLocaleString()}</span>
            </span>
            {regularPrice > salePrice ? (
              <span className="text-[11px] text-zinc-400 line-through sm:text-xs md:text-sm">
                ৳{regularPrice.toLocaleString()}
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="mt-1 grid grid-cols-[2rem_1fr] items-center gap-1.5 px-2 pb-2 pt-0 sm:mt-1.5 sm:grid-cols-[2.5rem_1fr] sm:px-2.5 sm:pb-2.5">
        <button
          type="button"
          onClick={handleCartToggle}
          aria-label={inCart ? "কার্ট থেকে সরান" : "কার্টে যোগ করুন"}
          title={inCart ? "কার্ট থেকে সরান" : "কার্টে যোগ করুন"}
          className={`flex h-8 w-full items-center justify-center rounded-md transition-colors cursor-pointer sm:h-9 ${
            inCart
              ? "border border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700"
              : "border border-zinc-200 bg-white text-zinc-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          }`}
        >
          {inCart ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={handleBuy}
          className="flex h-8 min-w-0 items-center justify-center gap-1 rounded-md bg-indigo-600 px-2 text-[16px] cursor-pointer font-semibold text-white transition-colors hover:bg-indigo-800 sm:h-9"
        >
          <Zap className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate sm:hidden">কিনুন</span>
          <span className="hidden truncate sm:inline">এখনই কিনুন</span>
        </button>
      </div>
    </motion.article>
  );
}
