"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Package } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import { getProductVariantConfig } from "@/lib/productVariants";

export default function HomeProductCard({ product }) {
  const router = useRouter();
  const { buyNow } = useCart();
  const variantConfig = getProductVariantConfig(product);
  const image = product.images?.[0]?.url;
  const title = product.title_bn || product.title_en;
  const salePrice = product.pricing?.sale_price;
  const outOfStock = product.inventory?.stock_status === "out_of_stock";

  function handleOrder(event) {
    event.preventDefault();
    event.stopPropagation();

    if (outOfStock) {
      toast.error("এই পণ্যটি স্টকে নেই");
      return;
    }

    if (variantConfig.required) {
      router.push(`/products/${product.slug}`);
      return;
    }

    buyNow(product);
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200/90 bg-white transition-all duration-200 hover:border-indigo-200 hover:shadow-[0_10px_28px_-14px_rgba(79,70,229,0.35)]">
      <Link href={`/products/${product.slug}`} className="block flex-1">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-50 sm:aspect-square">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              unoptimized
              className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-300">
              <Package className="h-8 w-8" />
            </div>
          )}
        </div>

        <div className="px-3 pb-2 pt-2.5 text-center sm:px-3.5 sm:pt-3">
          <h3 className="line-clamp-2 min-h-[2.25rem] text-[12px] leading-4 font-semibold text-zinc-800 sm:text-[13px] sm:leading-[18px]">
            {title}
          </h3>
          <p className="mt-1.5 text-base font-bold text-zinc-900 sm:text-[17px]">
            ৳{salePrice?.toLocaleString("bn-BD")}
          </p>
        </div>
      </Link>

      <div className="px-3 pb-3 sm:px-3.5 sm:pb-3.5">
        <button
          type="button"
          onClick={handleOrder}
          disabled={outOfStock}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-zinc-300 sm:text-[13px]"
        >
          {outOfStock ? "স্টক নেই" : "অর্ডার করুন"}
          {!outOfStock ? <ArrowRight className="h-3.5 w-3.5" /> : null}
        </button>
      </div>
    </article>
  );
}

export function HomeProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white">
      <div className="aspect-[4/3] animate-pulse bg-zinc-100 sm:aspect-square" />
      <div className="space-y-2 px-3 py-3">
        <div className="mx-auto h-3 w-4/5 animate-pulse rounded-md bg-zinc-100" />
        <div className="mx-auto h-4 w-1/3 animate-pulse rounded-md bg-zinc-100" />
        <div className="h-9 animate-pulse rounded-lg bg-zinc-100" />
      </div>
    </div>
  );
}
