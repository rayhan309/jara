"use client";

import { Package } from "lucide-react";
import { motion } from "motion/react";
import StoreProductCard from "@/components/products/StoreProductCard";
import HomeSectionHeader from "@/components/home/HomeSectionHeader";

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-md border border-zinc-100 bg-white shadow-sm">
      <div className="aspect-square animate-pulse bg-zinc-100" />
      <div className="space-y-1.5 px-2.5 py-2.5">
        <div className="h-3 w-full animate-pulse rounded-md bg-zinc-100" />
        <div className="h-3 w-2/3 animate-pulse rounded-md bg-zinc-100" />
        <div className="h-4 w-16 animate-pulse rounded-md bg-zinc-100" />
      </div>
    </div>
  );
}

export default function HomeProductsSection({
  eyebrow,
  title,
  subtitle,
  href,
  products = [],
  isLoading = false,
  emptyMessage = "এখনও কোনো পণ্য নেই।",
  className = "",
}) {
  return (
    <section className={`py-8 sm:py-12 lg:py-14 ${className}`}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <HomeSectionHeader
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          href={href}
        />

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-md border border-dashed border-zinc-200 bg-white p-8 text-center shadow-sm">
            <Package className="mb-3 h-9 w-9 text-indigo-400" />
            <p className="text-sm text-zinc-500">{emptyMessage}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
            {products.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: Math.min(index * 0.03, 0.24) }}
                className="min-w-0"
              >
                <StoreProductCard product={product} index={index} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
