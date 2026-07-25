"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { getProductStockSummary } from "@/lib/variantStock";
import { useCategories } from "@/hooks/useCategories";
import { useDebouncedValue } from "@/hooks/useDebounce";
import { useDeleteProduct, useProducts } from "@/hooks/useProducts";
import { usePagination } from "@/hooks/usePagination";
import TablePagination from "@/components/dashboard/TablePagination";
import DashPageHeader from "@/components/dashboard/DashPageHeader";
import {
  DesktopTable,
  MobileCardList,
  MobileDashCard,
  MobileDashRow,
} from "@/components/shared/ResponsiveTable";

const inputClass =
  "w-full rounded-md border border-dash-border bg-white px-3 py-2.5 text-sm text-dash-text outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

const categoryTabClass = (active) =>
  `shrink-0 rounded-md border px-3.5 py-2 text-sm font-semibold transition-colors sm:px-4 ${
    active
      ? "border-indigo-200 bg-indigo-50 text-indigo-700"
      : "border-dash-border bg-white text-dash-muted hover:border-indigo-200 hover:text-indigo-700"
  }`;

function ProductRowActions({ product, onDelete, isDeleting }) {
  const iconBtn =
    "inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors";

  return (
    <div className="flex items-center justify-end gap-0.5">
      <Link
        href={`/dashboard/products/${product._id}/edit`}
        aria-label="Edit product"
        title="Edit"
        className={`${iconBtn} text-slate-400 hover:bg-slate-100 hover:text-indigo-600`}
      >
        <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
      </Link>
      <button
        type="button"
        aria-label="Delete product"
        title="Delete"
        onClick={() => onDelete(product)}
        disabled={isDeleting}
        className={`${iconBtn} text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50`}
      >
        {isDeleting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        )}
      </button>
    </div>
  );
}

function ProductPriceCell({ product }) {
  const pricing = product.pricing || {};
  const salePrice = pricing.sale_price ?? 0;
  const regularPrice = pricing.regular_price ?? 0;
  const discount = pricing.discount_percentage || 0;
  const hasDiscount = regularPrice > salePrice;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="text-sm font-semibold tabular-nums text-dash-text">
        ৳{salePrice.toLocaleString()}
      </span>
      {hasDiscount ? (
        <span className="text-xs tabular-nums text-slate-400 line-through">
          ৳{regularPrice.toLocaleString()}
        </span>
      ) : null}
      {discount > 0 ? (
        <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
          -{discount}%
        </span>
      ) : null}
    </div>
  );
}

function ProductStockCell({ product }) {
  const summary = getProductStockSummary(product);

  return (
    <div className="text-sm text-dash-text">
      <span className="font-medium tabular-nums">{summary.quantity}</span>
      {summary.hasVariants ? (
        <span className="mt-0.5 block text-[11px] text-dash-muted">{summary.label}</span>
      ) : summary.label !== String(summary.quantity) ? (
        <span className="mt-0.5 block text-[11px] text-dash-muted">{summary.label}</span>
      ) : null}
    </div>
  );
}

export default function ProductsManager({ embedded = false }) {
  const { data: categories = [] } = useCategories();
  const { mutate: deleteProduct, isPending: isDeleting, variables: deletingId } = useDeleteProduct();
  const [searchInput, setSearchInput] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const debouncedSearch = useDebouncedValue(searchInput, 500);

  const {
    data: products = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useProducts({ search: debouncedSearch, category: categoryFilter });

  const { page, setPage, totalPages, totalItems, pageSize, paginatedItems } =
    usePagination(products);

  const isSearching = searchInput !== debouncedSearch || (isFetching && !isLoading);

  function handleDelete(product) {
    if (!window.confirm(`Delete "${product.title_bn || product.title_en}"?`)) return;
    deleteProduct(product._id);
  }

  const addProductLink = (
    <Link
      href="/dashboard/products/new"
      className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
    >
      <Plus className="h-4 w-4" />
      Add Product
    </Link>
  );

  return (
    <div className="space-y-6">
      {embedded ? (
        <div className="flex justify-end">{addProductLink}</div>
      ) : (
        <DashPageHeader
          eyebrow="Catalog"
          title="Product Catalog"
          description="Manage regular and variable products with pricing, inventory and images."
          action={addProductLink}
        />
      )}

      <div className="space-y-3">
        <div className="relative">
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by name, brand, or slug..."
            className={`${inputClass} w-full ${isSearching ? "pr-10" : ""}`}
          />
          {isSearching ? (
            <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-indigo-500" />
          ) : null}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={categoryTabClass(categoryFilter === "all")}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              type="button"
              onClick={() => setCategoryFilter(category._id)}
              className={categoryTabClass(categoryFilter === category._id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="dash-card flex min-h-[280px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : isError ? (
        <div className="dash-card border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-600">{error?.message || "Failed to load products."}</p>
          <button type="button" onClick={() => refetch()} className="mt-3 text-sm font-semibold text-indigo-600">
            Try again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="dash-card flex min-h-[280px] flex-col items-center justify-center p-10 text-center">
          <Package className="mb-4 h-10 w-10 text-indigo-600" />
          <h2 className="text-lg font-bold text-dash-text">
            {!debouncedSearch && categoryFilter === "all" ? "No products yet" : "No matching products"}
          </h2>
          {!debouncedSearch && categoryFilter === "all" ? (
            <div className="mt-5">{addProductLink}</div>
          ) : (
            <p className="mt-2 text-sm text-dash-muted">Try a different search term or category filter.</p>
          )}
        </div>
      ) : (
        <div className="dash-card overflow-hidden">
          <MobileCardList className="space-y-0 divide-y divide-dash-border p-0">
            {paginatedItems.map((product) => {
              const mainImage = product.images?.[0]?.url;

              return (
                <div key={product._id} className="p-3.5">
                  <MobileDashCard className="border-0 p-0 shadow-none">
                    <div className="flex gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200/80 bg-slate-50 shadow-sm">
                        {mainImage ? (
                          <Image src={mainImage} alt={product.title_bn || product.title_en} fill unoptimized className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-dash-muted">
                            <Package className="h-4 w-4 opacity-40" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold leading-snug text-dash-text">
                          {product.title_bn || product.title_en}
                        </p>
                        <span className="mt-1.5 inline-block max-w-full truncate rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          {product.category}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2 border-t border-dash-border pt-3">
                      <MobileDashRow label="Price" value={<ProductPriceCell product={product} />} />
                      <MobileDashRow label="Qty" value={<ProductStockCell product={product} />} />
                    </div>
                    <div className="mt-3 flex justify-end border-t border-dash-border pt-3">
                      <ProductRowActions
                        product={product}
                        onDelete={handleDelete}
                        isDeleting={isDeleting && deletingId === product._id}
                      />
                    </div>
                  </MobileDashCard>
                </div>
              );
            })}
          </MobileCardList>

          <DesktopTable>
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-dash-border bg-slate-50/90">
                  <th className="w-[68px] px-4 py-2.5 text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                    Image
                  </th>
                  <th className="min-w-[180px] px-4 py-2.5 text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                    Product
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                    Category
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                    Price
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                    Qty
                  </th>
                  <th className="w-[88px] px-4 py-2.5 text-right text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedItems.map((product) => {
                  const mainImage = product.images?.[0]?.url;

                  return (
                    <tr key={product._id} className="group transition-colors hover:bg-slate-50/70">
                      <td className="px-4 py-2.5">
                        <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-slate-200/80 bg-slate-50 shadow-sm">
                          {mainImage ? (
                            <Image src={mainImage} alt={product.title_bn || product.title_en} fill unoptimized className="object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-dash-muted">
                              <Package className="h-3.5 w-3.5 opacity-40" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="max-w-[240px] px-4 py-2.5">
                        <p className="line-clamp-2 text-[13px] font-medium leading-snug text-dash-text">
                          {product.title_bn || product.title_en}
                        </p>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="inline-block max-w-[160px] truncate rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                          {product.category}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        <ProductPriceCell product={product} />
                      </td>
                      <td className="px-4 py-2.5">
                        <ProductStockCell product={product} />
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="opacity-80 transition-opacity group-hover:opacity-100">
                          <ProductRowActions
                            product={product}
                            onDelete={handleDelete}
                            isDeleting={isDeleting && deletingId === product._id}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </DesktopTable>
          <TablePagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
