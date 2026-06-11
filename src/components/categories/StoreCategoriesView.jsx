"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Layers, RefreshCw, Search, ShoppingBag, Sparkles } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import {
  buildCategoryProductCounts,
  filterCategoriesBySearch,
} from "@/lib/categoryHelpers";
import {
  CategoryPageCard,
  CategoryPageCardSkeleton,
} from "@/components/categories/CategoryPageCard";

const GRID_CLASS =
  "grid min-w-0 grid-cols-2 gap-2 min-[400px]:grid-cols-3 sm:grid-cols-4 sm:gap-2.5 md:grid-cols-5 md:gap-3 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10";

const SKELETON_COUNT = 10;

export default function StoreCategoriesView() {
  const { data: categories = [], isLoading, isError, error, refetch } = useCategories();
  const { data: products = [] } = useProducts();
  const [search, setSearch] = useState("");

  const productCounts = useMemo(
    () => buildCategoryProductCounts(products, categories),
    [products, categories]
  );

  const filteredCategories = useMemo(
    () => filterCategoriesBySearch(categories, search),
    [categories, search]
  );

  const totalProducts = products.length;

  return (
    <div>
      <div className="relative overflow-hidden rounded-md border border-indigo-100/80 bg-gradient-to-br from-indigo-50 via-white to-violet-50/60 p-4 sm:p-6 lg:p-7">
        <div
          className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-indigo-200/30 blur-3xl"
          aria-hidden
        />
        <div className="relative grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="text-[10px] font-bold tracking-[0.22em] text-indigo-600 uppercase sm:text-[11px]">
              ক্যাটাগরি এক্সপ্লোর
            </p>
            <h1 className="mt-2 text-[1.5rem] leading-tight font-bold tracking-tight text-zinc-900 sm:text-2xl lg:text-[1.85rem]">
              সব ক্যাটাগরি
            </h1>
            <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-zinc-600 sm:text-sm">
              কমপ্যাক্ট গ্রিডে সব ক্যাটাগরি — দ্রুত বেছে নিন এবং পণ্য দেখুন।
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 shadow-sm sm:text-xs">
                <Layers className="h-3.5 w-3.5 text-indigo-600" />
                {categories.length} ক্যাটাগরি
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 shadow-sm sm:text-xs">
                <ShoppingBag className="h-3.5 w-3.5 text-indigo-600" />
                {totalProducts} পণ্য
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 shadow-sm sm:text-xs">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                নতুন কালেকশন
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <label htmlFor="category-search" className="sr-only">
              ক্যাটাগরি খুঁজুন
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="category-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ক্যাটাগরি খুঁজুন..."
                className="w-full rounded-md border border-zinc-200 bg-white py-2.5 pr-4 pl-9 text-sm text-zinc-800 shadow-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <Link
              href="/products"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 sm:w-auto"
            >
              সব পণ্য দেখুন
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mt-8">
        <div className="mb-4 flex items-end justify-between gap-3 border-b border-zinc-200/80 pb-3 sm:mb-5 sm:pb-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-indigo-600 uppercase">
              {search.trim() ? "ফলাফল" : "ব্রাউজ"}
            </p>
            <h2 className="mt-1 text-base font-bold text-zinc-900 sm:text-lg">
              {search.trim() ? `"${search.trim()}" অনুসন্ধান` : "সব ক্যাটাগরি"}
            </h2>
          </div>
          {!isLoading && !isError ? (
            <p className="text-[11px] font-medium text-zinc-500 sm:text-xs">
              {filteredCategories.length}টি
            </p>
          ) : null}
        </div>

        {isLoading ? (
          <div className={GRID_CLASS}>
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <CategoryPageCardSkeleton key={index} />
            ))}
          </div>
        ) : isError ? (
          <div className="mx-auto max-w-md rounded-md border border-red-100 bg-red-50/80 px-6 py-10 text-center">
            <p className="text-sm text-red-600">
              {error?.message || "ক্যাটাগরি লোড করা যায়নি।"}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
            >
              <RefreshCw className="h-4 w-4" />
              আবার চেষ্টা করুন
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div className="mx-auto max-w-md rounded-md border border-dashed border-zinc-200 bg-white px-6 py-14 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-indigo-50 text-indigo-400">
              <Layers className="h-7 w-7" />
            </span>
            <p className="mt-4 text-sm text-zinc-500">এখনও কোনো ক্যাটাগরি যোগ করা হয়নি।</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="rounded-md border border-dashed border-zinc-200 bg-white px-6 py-14 text-center">
            <Search className="mx-auto h-8 w-8 text-zinc-300" />
            <p className="mt-3 text-sm font-semibold text-zinc-700">কোনো ক্যাটাগরি পাওয়া যায়নি</p>
            <p className="mt-1 text-sm text-zinc-500">অন্য keyword দিয়ে আবার খুঁজুন।</p>
          </div>
        ) : (
          <div className={GRID_CLASS}>
            {filteredCategories.map((category, index) => (
              <CategoryPageCard
                key={category._id}
                category={category}
                productCount={productCounts.get(category._id) || 0}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
