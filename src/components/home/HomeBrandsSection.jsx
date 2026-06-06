"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { motion } from "motion/react";
import HomeSectionHeader from "@/components/home/HomeSectionHeader";
import "swiper/css";

export default function HomeBrandsSection({ brands = [] }) {
  if (brands.length === 0) return null;

  return (
    <section className="border-t border-zinc-100 bg-zinc-50 py-8 sm:py-12 lg:py-14">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <HomeSectionHeader
          eyebrow="ব্র্যান্ড"
          title="আমাদের ব্র্যান্ড সমূহ"
          subtitle="বিশ্বস্ত ব্র্যান্ডের মানসম্মত ও অরিজিনাল পণ্য"
          href="/products"
        />

        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 2800, disableOnInteraction: false }}
          loop={brands.length > 4}
          spaceBetween={12}
          slidesPerView={2.15}
          breakpoints={{
            480: { slidesPerView: 2.5, spaceBetween: 14 },
            640: { slidesPerView: 3.2, spaceBetween: 14 },
            768: { slidesPerView: 4, spaceBetween: 16 },
            1024: { slidesPerView: 5, spaceBetween: 16 },
            1280: { slidesPerView: 6, spaceBetween: 18 },
          }}
          className="!overflow-visible"
        >
          {brands.map((brand, index) => (
            <SwiperSlide key={brand.name} className="!h-auto">
              <motion.div
                className="h-full"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04 }}
              >
                <Link
                  href="/products"
                  className="group flex h-full flex-col overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-zinc-50">
                    {brand.image ? (
                      <Image
                        src={brand.image}
                        alt={brand.name}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 45vw, 180px"
                        className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-indigo-600 text-xl font-bold text-white sm:text-2xl">
                        {brand.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex min-h-[2.75rem] items-center justify-center px-2.5 py-2">
                    <span className="line-clamp-2 text-center text-[11px] leading-snug font-semibold text-zinc-700 group-hover:text-indigo-700 sm:text-xs">
                      {brand.name}
                    </span>
                  </div>
                </Link>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
