"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  clearSelectedCategoryId,
  findCategoryById,
  findCategoryBySlug,
  getSelectedCategoryId,
  setSelectedCategoryId,
} from "@/lib/categoryFilter";
import { useCategories } from "@/hooks/useCategories";

export function useCategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slugParam = searchParams.get("category");
  const { data: categories = [], isLoading } = useCategories();
  const [selectedCategoryId, setSelectedCategoryIdState] = useState(null);

  useEffect(() => {
    if (!categories.length) return;

    if (slugParam) {
      const matched = findCategoryBySlug(categories, slugParam);
      if (matched) {
        setSelectedCategoryId(matched._id);
        setSelectedCategoryIdState(matched._id);
        return;
      }
    }

    const storedId = getSelectedCategoryId();
    const storedCategory = findCategoryById(categories, storedId);

    if (storedCategory) {
      setSelectedCategoryIdState(storedCategory._id);
      if (!slugParam) {
        router.replace(`/products?category=${storedCategory.slug}`, { scroll: false });
      }
      return;
    }

    clearSelectedCategoryId();
    setSelectedCategoryIdState(null);
  }, [slugParam, categories, router]);

  const selectedCategory = useMemo(
    () => findCategoryById(categories, selectedCategoryId),
    [categories, selectedCategoryId]
  );

  function selectCategory(category) {
    if (!category) {
      clearSelectedCategoryId();
      setSelectedCategoryIdState(null);
      router.push("/products", { scroll: false });
      return;
    }

    setSelectedCategoryId(category._id);
    setSelectedCategoryIdState(category._id);
    router.push(`/products?category=${category.slug}`, { scroll: false });
  }

  return {
    categories,
    isLoading,
    selectedCategory,
    selectedCategoryId,
    selectCategory,
  };
}
