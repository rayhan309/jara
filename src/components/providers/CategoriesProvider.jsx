"use client";

import { createContext, useContext } from "react";
import { useCategoriesList } from "@/hooks/useCategories";

const CategoriesContext = createContext(null);

export function useCategoriesContext() {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error("useCategoriesContext must be used within CategoriesProvider");
  }
  return context;
}

export { useCategoriesList } from "@/hooks/useCategories";

export default function CategoriesProvider({ children, initialCategories = [] }) {
  const value = useCategoriesList({
    initialData: initialCategories,
    staleTime: 60 * 1000,
  });

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}
