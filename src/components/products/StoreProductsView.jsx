"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Layers,
  Loader2,
  Package,
  ShoppingBag,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { filterProductsByCategory } from "@/lib/categoryFilter";
import { useCategoryFilter } from "@/hooks/useCategoryFilter";
import { useProducts } from "@/hooks/useProducts";
import StoreProductCard from "@/components/products/StoreProductCard";

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-md border border-zinc-100 bg-white">
      <div className="aspect-square animate-pulse bg-zinc-100" />
      <div className="space-y-1.5 px-2.5 py-2">
        <div className="h-3 w-full animate-pulse rounded-md bg-zinc-100" />
        <div className="h-3 w-2/3 animate-pulse rounded-md bg-zinc-100" />
        <div className="h-4 w-16 animate-pulse rounded-md bg-zinc-100" />
      </div>
    </div>
  );
}

export default function StoreProductsView() {
  const {
    categories,
    isLoading: categoriesLoading,
    selectedCategory,
    selectedCategoryId,
    selectCategory,
  } = useCategoryFilter();

  const { data: products = [], isLoading, isError, error, refetch } = useProducts();

  const filteredProducts = useMemo(
    () => filterProductsByCategory(products, selectedCategory),
    [products, selectedCategory]
  );

  const pageTitle = selectedCategory ? selectedCategory.name : "সব পণ্য";
  const pageDescription = selectedCategory
    ? `"${selectedCategory.name}" ক্যাটাগরির curated পণ্য — দ্রুত বেছে নিন এবং অর্ডার করুন।`
    : "আমাদের সম্পূর্ণ কালেকশন এক জায়গায় — ক্যাটাগরি ফিল্টার করে পছন্দের পণ্য খুঁজে নিন।";

  const isLoadingContent = isLoading || categoriesLoading;

  return (
    <div>
      <div className="relative overflow-hidden rounded-md border border-indigo-100/80 bg-gradient-to-br from-indigo-50 via-white to-violet-50/60 p-5 sm:p-6 lg:p-7">
        <div
          className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-indigo-200/30 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-violet-200/25 blur-3xl"
          aria-hidden
        />

        <div className="relative grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="text-[10px] font-bold tracking-[0.22em] text-indigo-600 uppercase sm:text-[11px]">
              {selectedCategory ? "ক্যাটাগরি কালেকশন" : "শপ কালেকশন"}
            </p>
            <h1 className="mt-2 text-[1.5rem] leading-tight font-bold tracking-tight text-zinc-900 sm:text-2xl lg:text-[1.85rem]">
              {pageTitle}
            </h1>
            <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-zinc-600 sm:text-sm">
              {pageDescription}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 shadow-sm sm:text-xs">
                <ShoppingBag className="h-3.5 w-3.5 text-indigo-600" />
                {isLoadingContent ? "..." : `${filteredProducts.length} পণ্য`}
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 shadow-sm sm:text-xs">
                <Layers className="h-3.5 w-3.5 text-indigo-600" />
                {categories.length} ক্যাটাগরি
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 shadow-sm sm:text-xs">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                {products.length} মোট পণ্য
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 sm:items-start lg:items-end">
            {selectedCategory ? (
              <button
                type="button"
                onClick={() => selectCategory(null)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition-colors hover:bg-indigo-50 sm:w-auto"
              >
                <X className="h-4 w-4" />
                ফিল্টার সরান
              </button>
            ) : null}
            <Link
              href="/categories"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 sm:w-auto"
            >
              ক্যাটাগরি দেখুন
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-md border border-zinc-200/90 bg-white p-3 shadow-sm sm:mt-6 sm:p-4">
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-indigo-600" />
            <p className="text-[11px] font-bold tracking-[0.14em] text-zinc-500 uppercase sm:text-xs">
              ক্যাটাগরি ফিল্টার
            </p>
          </div>
          {selectedCategory ? (
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-700 sm:text-[11px]">
              {selectedCategory.name}
            </span>
          ) : null}
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => selectCategory(null)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors sm:text-[13px] ${
              !selectedCategoryId
                ? "bg-indigo-600 text-white shadow-sm"
                : "border border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            }`}
          >
            সব
          </button>

          {categoriesLoading ? (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              লোড হচ্ছে...
            </span>
          ) : (
            categories.map((category) => {
              const active = selectedCategoryId === category._id;
              return (
                <button
                  key={category._id}
                  type="button"
                  onClick={() => selectCategory(category)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors sm:text-[13px] ${
                    active
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "border border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                  }`}
                >
                  {category.name}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-6 sm:mt-8">
        {isLoadingContent ? (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 12 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm text-red-600">{error?.message || "পণ্য লোড করা যায়নি।"}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 text-sm font-semibold text-indigo-600"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-md border border-dashed border-zinc-200 bg-white px-6 py-16 text-center">
            <Package className="mx-auto h-10 w-10 text-zinc-300" />
            <p className="mt-4 text-sm text-zinc-500">
              {selectedCategory
                ? `"${selectedCategory.name}" ক্যাটাগরিতে এখনও কোনো পণ্য নেই।`
                : "এখনও কোনো পণ্য যোগ করা হয়নি।"}
            </p>
            {selectedCategory ? (
              <button
                type="button"
                onClick={() => selectCategory(null)}
                className="mt-4 text-sm font-semibold text-indigo-600"
              >
                সব পণ্য দেখুন
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-end justify-between gap-3 border-b border-zinc-200/80 pb-3 sm:mb-5 sm:pb-4">
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-indigo-600 uppercase">
                  ফলাফল
                </p>
                <h2 className="mt-1 text-base font-bold text-zinc-900 sm:text-lg">
                  {selectedCategory ? `${selectedCategory.name} পণ্য` : "সব পণ্য"}
                </h2>
              </div>
              <p className="text-[11px] font-medium text-zinc-500 sm:text-xs">
                {filteredProducts.length}টি পাওয়া গেছে
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5">
              {filteredProducts.map((product, index) => (
                <StoreProductCard key={product._id} product={product} index={index} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
