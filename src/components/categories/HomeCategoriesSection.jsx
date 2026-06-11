"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Layers, Loader2 } from "lucide-react";
import { setSelectedCategoryId } from "@/lib/categoryFilter";
import { useCategories } from "@/hooks/useCategories";

function CategoryCard({ category, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="min-w-0"
    >
      <Link
        href={`/products?category=${category.slug}`}
        onClick={() => setSelectedCategoryId(category._id)}
        className="group block"
      >
        <div className="aspect-square overflow-hidden rounded-full border border-zinc-200/90 bg-white p-1.5 shadow-[0_1px_3px_rgba(15,23,42,0.05)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-indigo-200 group-hover:shadow-[0_8px_24px_-8px_rgba(79,70,229,0.28)] sm:p-2">
          <div className="relative h-full w-full overflow-hidden rounded-full bg-zinc-50">
            {category.image?.url ? (
              <Image
                src={category.image.url}
                alt={category.name}
                fill
                unoptimized
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Layers className="h-8 w-8 text-zinc-300" />
              </div>
            )}
          </div>
        </div>
        <p className="mt-2.5 line-clamp-2 px-0.5 text-center text-[13px] leading-snug font-semibold text-zinc-800 transition-colors group-hover:text-indigo-700 sm:mt-3 sm:text-sm">
          {category.name}
        </p>
      </Link>
    </motion.div>
  );
}

function CategoryCardSkeleton() {
  return (
    <div className="min-w-0">
      <div className="aspect-square rounded-full border border-zinc-100 bg-white p-2">
        <div className="h-full w-full animate-pulse rounded-full bg-zinc-100" />
      </div>
      <div className="mx-auto mt-3 h-3.5 w-3/4 animate-pulse rounded-md bg-zinc-100" />
    </div>
  );
}

export default function HomeCategoriesSection() {
  const { data: categories = [], isLoading, isError } = useCategories();

  if (isError || (!isLoading && categories.length === 0)) {
    return null;
  }

  return (
    <section className="border-b border-zinc-100 bg-white py-8 sm:py-10 lg:py-12">
      <div className="store-container">
        <div className="mb-7 text-center sm:mb-8">
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl lg:text-2xl">
            আমাদের সেরা ক্যাটাগরি সমূহ
          </h2>
          <div
            className="mx-auto mt-3 h-1 w-14 rounded-full bg-gradient-to-r from-indigo-400 via-indigo-600 to-violet-500 sm:mt-3.5 sm:w-16"
            aria-hidden
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
            {Array.from({ length: 6 }).map((_, index) => (
              <CategoryCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
            {categories.map((category, index) => (
              <CategoryCard key={category._id} category={category} index={index} />
            ))}
          </div>
        )}

        {isLoading ? (
          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ক্যাটাগরি লোড হচ্ছে...
          </p>
        ) : null}
      </div>
    </section>
  );
}
