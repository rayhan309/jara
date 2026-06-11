"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { setSelectedCategoryId } from "@/lib/categoryFilter";

export default function HomeCategoriesBar() {
  const pathname = usePathname();
  const { data: categories = [], isLoading } = useCategories();
  const isHome = pathname === "/";

  if (!isHome) return null;

  return (
    <nav
      aria-label="ক্যাটাগরি মেনু"
      className="border-b border-indigo-800/80 bg-indigo-700 text-white"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto py-2 sm:gap-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link
          href="/"
          className="shrink-0 rounded-md bg-indigo-600 px-3 py-1.5 text-[13px] font-semibold whitespace-nowrap transition-colors hover:bg-indigo-500 sm:text-sm"
        >
          হোম
        </Link>

        {isLoading ? (
          <span className="inline-flex shrink-0 items-center gap-2 px-3 py-1.5 text-xs text-indigo-200">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            লোড হচ্ছে...
          </span>
        ) : (
          categories.map((category) => (
            <Link
              key={category._id}
              href={`/products?category=${category.slug}`}
              onClick={() => setSelectedCategoryId(category._id)}
              className="shrink-0 rounded-md px-3 py-1.5 text-[13px] font-medium whitespace-nowrap text-indigo-50 transition-colors hover:bg-indigo-600/90 hover:text-white sm:text-sm"
            >
              {category.name}
            </Link>
          ))
        )}

        {!isLoading && categories.length > 0 ? (
          <Link
            href="/categories"
            className="ml-auto shrink-0 rounded-md border border-indigo-500/80 px-3 py-1.5 text-[12px] font-semibold whitespace-nowrap text-indigo-100 transition-colors hover:bg-indigo-600 sm:text-[13px]"
          >
            সব ক্যাটাগরি
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
