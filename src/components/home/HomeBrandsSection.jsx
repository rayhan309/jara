"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { motion } from "motion/react";
import { getProductCardImageUrl } from "@/lib/imageUrl";
import "swiper/css";

function BrandCard({ brand, index }) {
  const imageSrc = getProductCardImageUrl(brand.image);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="h-full"
    >
      <Link
        href="/products"
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_12px_32px_-14px_rgba(79,70,229,0.35)]"
      >
        <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-zinc-50">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={brand.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 45vw, 180px"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-indigo-600">
              <span className="text-2xl font-bold text-white sm:text-3xl">
                {brand.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="border-t border-zinc-100 px-3 py-3 text-center sm:px-4 sm:py-3.5">
          <p className="line-clamp-2 text-[12px] font-semibold leading-snug text-zinc-800 transition-colors group-hover:text-indigo-700 sm:text-[13px]">
            {brand.name}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

function SectionHeader() {
  return (
    <div className="mb-8 text-center sm:mb-10">
      <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1 text-[11px] font-semibold tracking-wide text-indigo-700 uppercase">
        <Sparkles className="h-3.5 w-3.5" />
        ব্র্যান্ড
      </div>
      <h2 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl lg:text-[1.75rem]">
        আমাদের ব্র্যান্ড সমূহ
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-zinc-500">
        বিশ্বস্ত ব্র্যান্ডের মানসম্মত ও অরিজিনাল পণ্য
      </p>
      <div
        className="mx-auto mt-3 h-0.5 w-14 rounded-full bg-gradient-to-r from-indigo-400 via-indigo-600 to-violet-500"
        aria-hidden
      />
      <Link
        href="/products"
        className="group mt-5 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-2 text-[13px] font-semibold text-indigo-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 sm:text-sm"
      >
        সবগুলো দেখুন
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

export default function HomeBrandsSection({ brands = [] }) {
  if (brands.length === 0) return null;

  const useGrid = brands.length <= 6;

  return (
    <section className="relative overflow-hidden border-t border-zinc-100 bg-white py-10 sm:py-12 lg:py-14">
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[min(100%,720px)] -translate-x-1/2 rounded-full bg-indigo-100/40 blur-3xl"
        aria-hidden
      />

      <div className="store-container relative">
        <SectionHeader />

        {useGrid ? (
          <div
            className={`mx-auto grid gap-3.5 sm:gap-4 ${
              brands.length === 1
                ? "max-w-[200px] grid-cols-1"
                : brands.length === 2
                  ? "max-w-md grid-cols-2"
                  : brands.length === 3
                    ? "max-w-2xl grid-cols-2 sm:grid-cols-3"
                    : "max-w-4xl grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            }`}
          >
            {brands.map((brand, index) => (
              <BrandCard key={brand.name} brand={brand} index={index} />
            ))}
          </div>
        ) : (
          <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 2800, disableOnInteraction: false }}
            loop={brands.length > 5}
            spaceBetween={14}
            slidesPerView={2.2}
            breakpoints={{
              480: { slidesPerView: 2.8, spaceBetween: 14 },
              640: { slidesPerView: 3.5, spaceBetween: 16 },
              768: { slidesPerView: 4.2, spaceBetween: 16 },
              1024: { slidesPerView: 5, spaceBetween: 18 },
              1280: { slidesPerView: 6, spaceBetween: 20 },
            }}
            className="!overflow-visible brands-swiper"
          >
            {brands.map((brand, index) => (
              <SwiperSlide key={brand.name} className="!h-auto">
                <BrandCard brand={brand} index={index} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
}
