"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const HERO_SLIDES = [
  { src: "/images/banner-1.jpg", alt: "Nexa Commerce ব্যানার ১", href: "/products" },
  { src: "/images/banner2.jpg", alt: "Nexa Commerce ব্যানার ২", href: "/products" },
  { src: "/images/banner3.jpg", alt: "Nexa Commerce ব্যানার ৩", href: "/products" },
];

export default function HeroSwiper() {
  return (
    <section className="relative overflow-hidden bg-zinc-100">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        className="hero-swiper"
      >
        {HERO_SLIDES.map((slide) => (
          <SwiperSlide key={slide.src}>
            <Link href={slide.href} className="block">
              <div className="relative aspect-[4/3] w-full sm:aspect-[16/7] lg:aspect-[21/8]">
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  priority
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
