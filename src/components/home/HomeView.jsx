"use client";

import { useMemo } from "react";
import HeroSwiper from "@/components/home/HeroSwiper";
import HomeCategoriesSection from "@/components/categories/HomeCategoriesSection";
import HomeCategoryProductsView from "@/components/home/HomeCategoryProductsView";
import HomeBrandsSection from "@/components/home/HomeBrandsSection";
import { useProducts } from "@/hooks/useProducts";
import { getBrandList } from "@/lib/homeProducts";

export default function HomeView() {
  const { data: products = [] } = useProducts();

  const brands = useMemo(() => getBrandList(products, 12), [products]);

  return (
    <>
      <HeroSwiper />
      <HomeCategoriesSection />
      <HomeCategoryProductsView />
      <HomeBrandsSection brands={brands} />
    </>
  );
}
