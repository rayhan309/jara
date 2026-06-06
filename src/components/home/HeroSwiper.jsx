"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import { ArrowRight } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const HERO_SLIDES = [
  {
    src: "/images/banner-1.jpg",
    alt: "Nexa Commerce প্রমো ব্যানার ১",
    eyebrow: "প্রিমিয়াম শপিং",
    title: "কেনাকাটার আপনার নতুন প্রিয় ঠিকানা",
    subtitle: "মানসম্মত পণ্য, দ্রুত ডেলিভারি এবং সহজ অর্ডার ট্র্যাকিং",
    cta: { href: "/products", label: "এখনই কেনাকাটা করুন" },
  },
  {
    src: "/images/banner2.jpg",
    alt: "Nexa Commerce প্রমো ব্যানার ২",
    eyebrow: "বিশেষ অফার",
    title: "বেস্ট অফার ও এক্সক্লুসিভ ডিল",
    subtitle: "পছন্দের পণ্যে বিশেষ ছাড় — সীমিত সময়ের জন্য",
    cta: { href: "/products", label: "অফার দেখুন" },
  },
  {
    src: "/images/banner3.jpg",
    alt: "Nexa Commerce প্রমো ব্যানার ৩",
    eyebrow: "নতুন কালেকশন",
    title: "নতুন কালেকশন এখন লাইভ",
    subtitle: "শপে নতুন এসেছে সর্বশেষ প্রডাক্ট কালেকশন",
    cta: { href: "/products", label: "নতুন পণ্য দেখুন" },
  },
];

export default function HeroSwiper() {
  return (
    <section className="relative overflow-hidden bg-zinc-900">
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
            <div className="relative aspect-[4/3] w-full sm:aspect-[16/7] lg:aspect-[21/8]">
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/50 to-zinc-900/20 sm:bg-gradient-to-r sm:from-zinc-950/85 sm:via-zinc-900/55 sm:to-transparent" />

              <div className="absolute inset-0 flex items-end pb-12 sm:items-center sm:pb-0">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="mx-auto max-w-2xl text-center sm:mx-0 sm:max-w-xl sm:text-left lg:max-w-2xl">
                    <p className="mb-2 text-[10px] font-bold tracking-[0.22em] text-indigo-300 uppercase sm:mb-3 sm:text-[11px]">
                      {slide.eyebrow}
                    </p>
                    <h1 className="text-[1.45rem] leading-[1.2] font-bold tracking-tight text-white sm:text-3xl lg:text-[2.65rem] lg:leading-[1.15]">
                      {slide.title}
                    </h1>
                    <p className="mt-2.5 line-clamp-2 text-[13px] leading-relaxed text-white/80 sm:mt-3 sm:line-clamp-none sm:max-w-md sm:text-[15px] lg:text-base">
                      {slide.subtitle}
                    </p>
                    <Link
                      href={slide.cta.href}
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-indigo-950/30 transition-colors hover:bg-indigo-500 sm:mt-6 sm:px-6 sm:text-sm"
                    >
                      {slide.cta.label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
