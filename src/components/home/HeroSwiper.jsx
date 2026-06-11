"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import { useStoreSettings } from "@/components/providers/SiteSettingsProvider";
import { getActiveHeroBanners } from "@/lib/heroBanners";
import { getOptimizedImageUrl } from "@/lib/imageUrl";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

function getBannerImageUrl(url) {
  return getOptimizedImageUrl(url, { width: 1600, height: 640, quality: 92 });
}

export default function HeroSwiper() {
  const settings = useStoreSettings();
  const slides = getActiveHeroBanners(settings.heroBanners);

  return (
    <section className="bg-white py-4 sm:py-5 lg:py-6">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-xl border border-zinc-200/90 bg-zinc-100 shadow-sm">
          <Swiper
            modules={[Autoplay, Pagination, EffectFade]}
            effect="fade"
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            loop={slides.length > 1}
            className="hero-swiper"
          >
            {slides.map((slide) => {
              const imageUrl = getBannerImageUrl(slide.image.url);

              return (
                <SwiperSlide key={slide.id}>
                  <Link href={slide.href || "/products"} className="block">
                    <div className="relative aspect-[16/8] w-full sm:aspect-[21/9]">
                      <Image
                        src={imageUrl}
                        alt={slide.alt}
                        fill
                        priority
                        quality={100}
                        unoptimized={imageUrl.includes("ik.imagekit.io")}
                        className="object-fill object-center"
                        sizes="(max-width: 1170px) 100vw, 1170px"
                      />
                    </div>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
