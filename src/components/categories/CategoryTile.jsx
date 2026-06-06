"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Layers } from "lucide-react";

import { setSelectedCategoryId } from "@/lib/categoryFilter";

export function CategoryTile({ category, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Link
        href={`/products?category=${category.slug}`}
        onClick={() => setSelectedCategoryId(category._id)}
        className="group flex h-full flex-col items-center gap-3 sm:gap-3.5"
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-md border border-zinc-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-indigo-200 group-hover:shadow-[0_12px_28px_-12px_rgba(79,70,229,0.35)] sm:p-5">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 via-transparent to-violet-50/0 opacity-0 transition-opacity duration-300 group-hover:from-indigo-50/40 group-hover:to-violet-50/30 group-hover:opacity-100" />
          <div className="relative flex h-full w-full items-center justify-center">
            {category.image?.url ? (
              <Image
                src={category.image.url}
                alt={category.name}
                width={160}
                height={160}
                unoptimized
                className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <Layers className="h-10 w-10 text-zinc-300" />
            )}
          </div>
        </div>

        <h3 className="line-clamp-2 min-h-[2.5rem] w-full px-1 text-center text-[13px] leading-snug font-semibold text-zinc-800 transition-colors group-hover:text-indigo-700 sm:text-sm">
          {category.name}
        </h3>
      </Link>
    </motion.div>
  );
}

export function CategoryTileSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="aspect-square w-full animate-pulse rounded-md border border-zinc-100 bg-zinc-100/80" />
      <div className="h-3.5 w-3/5 animate-pulse rounded-md bg-zinc-100" />
    </div>
  );
}
