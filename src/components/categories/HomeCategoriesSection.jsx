"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import { Layers, Loader2 } from "lucide-react";
import { setSelectedCategoryId } from "@/lib/categoryFilter";
import { useCategories } from "@/hooks/useCategories";
import "swiper/css";

function CategoryCard({ category }) {
  return (
    <Link
      href={`/products?category=${category.slug}`}
      onClick={() => setSelectedCategoryId(category._id)}
      className="group block min-w-0"
    >
      <div className="aspect-square overflow-hidden rounded-full border border-zinc-200/90 bg-white p-1 shadow-[0_1px_3px_rgba(15,23,42,0.05)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-indigo-200 group-hover:shadow-[0_8px_24px_-8px_rgba(79,70,229,0.28)] min-[360px]:p-1.5 sm:p-2">
        <div className="relative h-full w-full overflow-hidden rounded-full bg-zinc-50">
          {category.image?.url ? (
            <Image
              src={category.image.url}
              alt={category.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 22vw, 120px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Layers className="h-6 w-6 text-zinc-300 sm:h-8 sm:w-8" />
            </div>
          )}
        </div>
      </div>
      <p className="mt-1.5 line-clamp-2 px-0.5 text-center text-[10px] leading-snug font-semibold text-zinc-800 transition-colors group-hover:text-indigo-700 min-[360px]:mt-2 min-[360px]:text-[11px] sm:mt-2.5 sm:text-xs md:text-sm">
        {category.name}
      </p>
    </Link>
  );
}

function CategoryCardSkeleton() {
  return (
    <div className="min-w-0">
      <div className="aspect-square rounded-full border border-zinc-100 bg-white p-1.5">
        <div className="h-full w-full animate-pulse rounded-full bg-zinc-100" />
      </div>
      <div className="mx-auto mt-2 h-3 w-3/4 animate-pulse rounded-md bg-zinc-100" />
    </div>
  );
}

const SWIPER_BREAKPOINTS = {
  0: { slidesPerView: 4, spaceBetween: 8 },
  480: { slidesPerView: 4, spaceBetween: 10 },
  640: { slidesPerView: 5, spaceBetween: 12 },
  768: { slidesPerView: 6, spaceBetween: 14 },
  1024: { slidesPerView: 7, spaceBetween: 16 },
  1280: { slidesPerView: 8, spaceBetween: 18 },
};

export default function HomeCategoriesSection() {
  const { data: categories = [], isLoading, isError } = useCategories();

  if (isError || (!isLoading && categories.length === 0)) {
    return null;
  }

  return (
    <section className="border-b border-zinc-100 bg-white py-6 sm:py-10 lg:py-12">
      <div className="store-container">
        <div className="mb-6 text-center sm:mb-8">
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl lg:text-2xl">
            আমাদের সেরা ক্যাটাগরি সমূহ
          </h2>
          <div
            className="mx-auto mt-3 h-1 w-14 rounded-full bg-gradient-to-r from-indigo-400 via-indigo-600 to-violet-500 sm:mt-3.5 sm:w-16"
            aria-hidden
          />
        </div>

        {isLoading ? (
          <Swiper
            modules={[FreeMode]}
            freeMode
            watchOverflow
            breakpoints={SWIPER_BREAKPOINTS}
            className="home-categories-swiper"
          >
            {Array.from({ length: 8 }).map((_, index) => (
              <SwiperSlide key={index} className="!h-auto">
                <CategoryCardSkeleton />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <Swiper
            modules={[FreeMode]}
            freeMode
            watchOverflow
            breakpoints={SWIPER_BREAKPOINTS}
            className="home-categories-swiper"
          >
            {categories.map((category) => (
              <SwiperSlide key={category._id} className="!h-auto">
                <CategoryCard category={category} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {isLoading ? (
          <p className="mt-5 flex items-center justify-center gap-2 text-xs text-zinc-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ক্যাটাগরি লোড হচ্ছে...
          </p>
        ) : null}
      </div>
    </section>
  );
}
