"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Check, Package, ShoppingCart, Star, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import { getProductVariantConfig } from "@/lib/productVariants";

export default function StoreProductCard({ product, index = 0 }) {
  const router = useRouter();
  const { toggleCart, buyNow, items } = useCart();
  const variantConfig = getProductVariantConfig(product);
  const image = product.images?.[0]?.url;
  const discount = product.pricing?.discount_percentage || 0;
  const title = product.title_bn || product.title_en;
  const salePrice = product.pricing?.sale_price;
  const regularPrice = product.pricing?.regular_price;
  const outOfStock = product.inventory?.stock_status === "out_of_stock";
  const inCart = items.some((item) => item._id === product._id);

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
    if (variantConfig.required) {
      toast.error(`অনুগ্রহ করে ${variantConfig.label} বেছে নিন`);
      router.push(`/products/${product.slug}`);
      return;
    }
    buyNow(product);
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className="group flex h-full flex-col overflow-hidden rounded-md border border-zinc-200/90 bg-white transition-all duration-200 hover:border-zinc-300 hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.18)]"
    >
      <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-zinc-50">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              unoptimized
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.04]"
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

        <div className="flex flex-1 flex-col px-2.5 pt-2">
          <h3 className="line-clamp-2 min-h-[2.25rem] text-[12px] leading-4 font-semibold text-zinc-800 sm:text-[13px] sm:leading-[18px]">
            {title}
          </h3>

          {product.ratings?.average_rating > 0 ? (
            <div className="mt-1 flex items-center gap-0.5 text-[10px] text-amber-600">
              <Star className="h-3 w-3 fill-current" />
              <span className="font-semibold">{product.ratings.average_rating}</span>
              <span className="text-zinc-400">({product.ratings.total_reviews})</span>
            </div>
          ) : null}

          <div className="mt-auto flex flex-wrap items-baseline gap-1.5 pt-1.5">
            <span className="text-sm font-bold text-zinc-900 sm:text-[15px]">
              ৳{salePrice?.toLocaleString()}
            </span>
            {regularPrice > salePrice ? (
              <span className="text-[10px] text-zinc-400 line-through sm:text-[11px]">
                ৳{regularPrice.toLocaleString()}
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="grid grid-cols-[2.75rem_1fr] gap-1.5 px-2.5 pb-2.5 pt-1">
        <button
          type="button"
          onClick={handleCartToggle}
          aria-label={inCart ? "কার্ট থেকে সরান" : "কার্টে যোগ করুন"}
          title={inCart ? "কার্ট থেকে সরান" : "কার্টে যোগ করুন"}
          className={`inline-flex h-8 items-center justify-center rounded-md transition-colors ${
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
          className="inline-flex items-center justify-center gap-1 rounded-md bg-indigo-600 px-2 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-700 sm:text-xs"
        >
          <Zap className="h-3 w-3" />
          এখনই কিনুন
        </button>
      </div>
    </motion.article>
  );
}
