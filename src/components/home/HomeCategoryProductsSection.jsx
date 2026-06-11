"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { setSelectedCategoryId } from "@/lib/categoryFilter";
import StoreProductCard from "@/components/products/StoreProductCard";

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-md border border-zinc-100 bg-white">
      <div className="aspect-square animate-pulse bg-zinc-100" />
      <div className="space-y-1.5 px-2.5 py-2">
        <div className="h-3 w-full animate-pulse rounded-md bg-zinc-100" />
        <div className="h-3 w-2/3 animate-pulse rounded-md bg-zinc-100" />
        <div className="h-4 w-16 animate-pulse rounded-md bg-zinc-100" />
        <div className="mt-2 grid grid-cols-[2.75rem_1fr] gap-1.5">
          <div className="h-8 animate-pulse rounded-md bg-zinc-100" />
          <div className="h-8 animate-pulse rounded-md bg-zinc-100" />
        </div>
      </div>
    </div>
  );
}

function CategoryBlockSkeleton() {
  return (
    <section className="py-6 sm:py-8">
      <div className="mb-5 mx-auto h-6 w-40 animate-pulse rounded-md bg-zinc-100" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

export default function HomeCategoryProductsSection({
  category,
  products,
  totalCount,
  index = 0,
}) {
  const hasMore = totalCount > products.length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`py-6 sm:py-8 ${index % 2 === 1 ? "bg-zinc-50/80" : "bg-white"}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 text-center sm:mb-5">
          <h2 className="text-base font-bold tracking-tight text-zinc-900 sm:text-lg lg:text-xl">
            {category.name}
          </h2>
          <div
            className="mx-auto mt-2 h-0.5 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-300/40 sm:w-12"
            aria-hidden
          />

          {hasMore ? (
            <Link
              href={`/products?category=${category.slug}`}
              onClick={() => setSelectedCategoryId(category._id)}
              className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-indigo-600 transition-colors hover:text-indigo-700 sm:text-[13px]"
            >
              সব দেখুন
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {products.map((product, productIndex) => (
            <StoreProductCard key={product._id} product={product} index={productIndex} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export { CategoryBlockSkeleton };
