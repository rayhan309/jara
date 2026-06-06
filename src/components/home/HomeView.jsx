"use client";

import { useMemo } from "react";
import HeroSwiper from "@/components/home/HeroSwiper";
import TrustFeatures from "@/components/home/TrustFeatures";
import HomeCategoriesSection from "@/components/categories/HomeCategoriesSection";
import HomeProductsSection from "@/components/home/HomeProductsSection";
import HomeBrandsSection from "@/components/home/HomeBrandsSection";
import HomeVideoSection from "@/components/home/HomeVideoSection";
import { useProducts } from "@/hooks/useProducts";
import {
  getBestSellingProducts,
  getBrandList,
  getNewArrivalProducts,
} from "@/lib/homeProducts";

export default function HomeView() {
  const { data: products = [], isLoading } = useProducts();

  const bestSelling = useMemo(() => getBestSellingProducts(products, 10), [products]);
  const allProductsPreview = useMemo(() => products.slice(0, 10), [products]);
  const newArrivals = useMemo(() => getNewArrivalProducts(products, 10), [products]);
  const brands = useMemo(() => getBrandList(products, 12), [products]);

  return (
    <>
      <HeroSwiper />
      <TrustFeatures />
      <HomeCategoriesSection />
      <HomeProductsSection
        eyebrow="ট্রেন্ডিং"
        title="বেস্ট সেলিং প্রডাক্ট"
        subtitle="সবচেয়ে বেশি পছন্দ ও positive review পাওয়া পণ্যসমূহ"
        href="/products"
        products={bestSelling}
        isLoading={isLoading}
        className="bg-white"
      />
      <HomeProductsSection
        eyebrow="কালেকশন"
        title="সকল প্রডাক্ট"
        subtitle="আমাদের পুরো কালেকশন থেকে আপনার পছন্দের পণ্য বেছে নিন"
        href="/products"
        products={allProductsPreview}
        isLoading={isLoading}
        className="bg-zinc-50"
      />
      <HomeProductsSection
        eyebrow="নতুন"
        title="শপে নতুন এসেছে"
        subtitle="সর্বশেষ যোগ হওয়া ফ্রেশ ও এক্সক্লুসিভ পণ্য"
        href="/products"
        products={newArrivals}
        isLoading={isLoading}
        className="bg-white"
      />
      {/* <HomeVideoSection /> */}
      <HomeBrandsSection brands={brands} />
    </>
  );
}
