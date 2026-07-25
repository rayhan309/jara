"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import StoreContainer from "@/components/container/StoreContainer";
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
      <Box sx={{ borderTop: 1, borderColor: "divider", bgcolor: "background.paper" }}>
        <StoreContainer>
          <CategoryBlockSkeleton />
          <CategoryBlockSkeleton />
        </StoreContainer>
      </Box>
    );
  }

  if (categorySections.length === 0) {
    return null;
  }

  return (
    <Box sx={{ borderTop: 1, borderColor: "divider" }}>
      {categorySections.map((section, index) => (
        <HomeCategoryProductsSection
          key={section.category._id}
          category={section.category}
          products={section.products}
          totalCount={section.totalCount}
          index={index}
        />
      ))}
    </Box>
  );
}
