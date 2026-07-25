"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import Box from "@mui/material/Box";
import StoreContainer from "@/components/container/StoreContainer";
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
    <Box component="section" sx={{ bgcolor: "background.paper", py: { xs: 2, sm: 2.5, lg: 3 } }}>
      <StoreContainer>
        <Box
          sx={{
            overflow: "hidden",
            borderRadius: 1,
            border: 1,
            borderColor: "divider",
            bgcolor: "grey.100",
            boxShadow: 1,
          }}
        >
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
                  <Box component={Link} href={slide.href || "/products"} sx={{ display: "block" }}>
                    <Box
                      sx={{
                        position: "relative",
                        width: 1,
                        aspectRatio: { xs: "16 / 8", sm: "21 / 9" },
                      }}
                    >
                      <Image
                        src={imageUrl}
                        alt={slide.alt}
                        fill
                        priority
                        quality={100}
                        unoptimized={imageUrl.includes("ik.imagekit.io")}
                        style={{ objectFit: "fill", objectPosition: "center" }}
                        sizes="(max-width: 1170px) 100vw, 1170px"
                      />
                    </Box>
                  </Box>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </Box>
      </StoreContainer>
    </Box>
  );
}
