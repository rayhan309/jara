"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import Box from "@mui/material/Box";
import StoreContainer from "@/components/container/StoreContainer";
import { useStoreSettings } from "@/components/providers/SiteSettingsProvider";
import { getActiveHeroBanners, HERO_BANNER_IMAGE_SPEC } from "@/lib/heroBanners";
import { getOptimizedImageUrl } from "@/lib/imageUrl";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

function getBannerImageUrl(url) {
  return getOptimizedImageUrl(url, {
    width: HERO_BANNER_IMAGE_SPEC.width,
    height: HERO_BANNER_IMAGE_SPEC.height,
    quality: 92,
  });
}

export default function HeroSwiper() {
  const settings = useStoreSettings();
  const slides = getActiveHeroBanners(settings.heroBanners);

  return (
    <Box component="section" sx={{ bgcolor: "background.paper", py: { xs: 1.5, sm: 2, lg: 2.5 } }}>
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
                        aspectRatio: {
                          xs: "5 / 4",
                          sm: "3 / 2",
                          md: "16 / 10",
                          lg: "12 / 5",
                        },
                        minHeight: { xs: 280, sm: 360, md: 440, lg: 500 },
                        maxHeight: { xs: 440, sm: 520, md: 580, lg: 640 },
                      }}
                    >
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
