"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Package } from "lucide-react";
import { filterProductsByCategory } from "@/lib/categoryFilter";
import { filterProductsBySearch } from "@/lib/productSearch";
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
  return (
    <Suspense fallback={<StoreProductsFallback />}>
      <StoreProductsContent />
    </Suspense>
  );
}

function StoreProductsFallback() {
  return (
    <div>
      <div className="text-center">
        <div className="mx-auto h-7 w-32 animate-pulse rounded-md bg-zinc-100 sm:h-8 sm:w-40" />
        <div className="mx-auto mt-2.5 h-0.5 w-12 animate-pulse rounded-full bg-zinc-100" />
      </div>
      <div className="store-product-grid mt-6 sm:mt-8">
        {Array.from({ length: 12 }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

function StoreProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q")?.trim() || "";

  const {
    isLoading: categoriesLoading,
    selectedCategory,
    selectCategory,
  } = useCategoryFilter();

  const { data: products = [], isLoading, isError, error, refetch } = useProducts();

  const filteredProducts = useMemo(() => {
    const byCategory = filterProductsByCategory(products, selectedCategory);
    return filterProductsBySearch(byCategory, searchQuery);
  }, [products, selectedCategory, searchQuery]);

  const pageTitle = searchQuery
    ? `"${searchQuery}" — অনুসন্ধান`
    : selectedCategory
      ? selectedCategory.name
      : "সব পণ্য";
  const isLoadingContent = isLoading || categoriesLoading;

  function handleShowAllProducts() {
    selectCategory(null);
    router.push("/products");
  }

  return (
    <div>
      <div className="text-center">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
          {pageTitle}
        </h1>
        <div
          className="mx-auto mt-2 h-0.5 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-300/40 sm:mt-2.5 sm:w-12"
          aria-hidden
        />
      </div>

      <div className="mt-6 sm:mt-8">
        {isLoadingContent ? (
          <div className="store-product-grid">
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
              {searchQuery
                ? `"${searchQuery}" খুঁজে কোনো পণ্য পাওয়া যায়নি।`
                : selectedCategory
                  ? `"${selectedCategory.name}" ক্যাটাগরিতে এখনও কোনো পণ্য নেই।`
                  : "এখনও কোনো পণ্য যোগ করা হয়নি।"}
            </p>
            {searchQuery || selectedCategory ? (
              <button
                type="button"
                onClick={handleShowAllProducts}
                className="mt-4 text-sm font-semibold text-indigo-600"
              >
                সব পণ্য দেখুন
              </button>
            ) : null}
          </div>
        ) : (
          <div className="store-product-grid">
            {filteredProducts.map((product, index) => (
              <StoreProductCard key={product._id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
