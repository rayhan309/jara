"use client";

import { useMemo } from "react";
import { filterProductsByCategory } from "@/lib/categoryFilter";
import { getProductsByCategory } from "@/lib/homeProducts";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import HomeCategoryProductsSection, {
  CategoryBlockSkeleton,
} from "@/components/home/HomeCategoryProductsSection";

const PRODUCTS_PER_CATEGORY = 8;

export default function HomeCategoryProductsView() {
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: products = [], isLoading: productsLoading } = useProducts();

  const categorySections = useMemo(() => {
    const grouped = getProductsByCategory(categories, products, PRODUCTS_PER_CATEGORY);

    return grouped.map(({ category, products: preview }) => ({
      category,
      products: preview,
      totalCount: filterProductsByCategory(products, category).length,
    }));
  }, [categories, products]);

  const isLoading = categoriesLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="border-t border-zinc-100 bg-white">
        <div className="store-container">
          <CategoryBlockSkeleton />
          <CategoryBlockSkeleton />
        </div>
      </div>
    );
  }

  if (categorySections.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-zinc-100">
      {categorySections.map((section, index) => (
        <HomeCategoryProductsSection
          key={section.category._id}
          category={section.category}
          products={section.products}
          totalCount={section.totalCount}
          index={index}
        />
      ))}
    </div>
  );
}
