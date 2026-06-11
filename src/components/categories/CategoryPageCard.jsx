"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Layers } from "lucide-react";
import { setSelectedCategoryId } from "@/lib/categoryFilter";

export function CategoryPageCard({ category, productCount = 0, index = 0 }) {
  const hasImage = Boolean(category.image?.url);

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.2), duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="h-full min-w-0"
    >
      <Link
        href={`/products?category=${category.slug}`}
        onClick={() => setSelectedCategoryId(category._id)}
        className="group flex h-full flex-col gap-2"
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-md border border-zinc-200/90 bg-zinc-50 shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-indigo-200 group-hover:shadow-md">
          {hasImage ? (
            <Image
              src={category.image.url}
              alt={category.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 45vw, 120px"
              className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-600 to-violet-700">
              <Layers className="h-7 w-7 text-white/75 sm:h-8 sm:w-8" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-100" />

          <span className="absolute top-1.5 right-1.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700 shadow-sm sm:top-2 sm:right-2 sm:px-2 sm:text-[10px]">
            {productCount}
          </span>
        </div>

        <div className="min-w-0 px-0.5 text-center">
          <h3 className="line-clamp-2 text-[10px] leading-snug font-semibold text-zinc-800 transition-colors group-hover:text-indigo-700 min-[360px]:text-[11px] sm:text-xs">
            {category.name}
          </h3>
          <p className="mt-0.5 text-[10px] text-zinc-400">{productCount} পণ্য</p>
        </div>
      </Link>
    </motion.article>
  );
}

export function CategoryPageCardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="aspect-square w-full animate-pulse rounded-md border border-zinc-100 bg-zinc-100" />
      <div className="mx-auto h-3 w-3/4 animate-pulse rounded-md bg-zinc-100" />
      <div className="mx-auto h-2.5 w-1/2 animate-pulse rounded-md bg-zinc-100" />
    </div>
  );
}
