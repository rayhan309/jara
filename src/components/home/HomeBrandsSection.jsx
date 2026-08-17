"use client";

import Image from "next/image";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import StoreContainer from "@/components/container/StoreContainer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import { motion } from "motion/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { getProductCardImageUrl } from "@/lib/imageUrl";
import "swiper/css";

function BrandCard({ brand, index }) {
  const imageSrc = getProductCardImageUrl(brand.image);

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      sx={{ height: 1 }}
    >
      <Box
        component={Link}
        href="/products"
        sx={{
          display: "flex",
          flexDirection: "column",
          height: 1,
          overflow: "hidden",
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          textDecoration: "none",
          color: "inherit",
          transition: "transform 0.3s, box-shadow 0.3s, border-color 0.3s",
          "&:hover": {
            transform: "translateY(-4px)",
            borderColor: "primary.light",
            boxShadow: "0 12px 32px -14px rgba(79,70,229,0.35)",
          },
        }}
      >
        <Box sx={{ position: "relative", aspectRatio: "1 / 1", width: 1, bgcolor: "grey.50", overflow: "hidden" }}>
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={brand.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 45vw, 180px"
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
          ) : (
            <Stack alignItems="center" justifyContent="center" sx={{ height: 1, bgcolor: "primary.main" }}>
              <Typography variant="h4" fontWeight={700} color="common.white">
                {brand.name.charAt(0).toUpperCase()}
              </Typography>
            </Stack>
          )}
        </Box>
        <Box sx={{ borderTop: 1, borderColor: "grey.100", px: { xs: 1.5, sm: 2 }, py: { xs: 1.25, sm: 1.75 }, textAlign: "center" }}>
          <Typography variant="caption" fontWeight={600} color="text.primary" sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {brand.name}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function SectionHeader() {
  return (
    <Stack alignItems="center" sx={{ mb: { xs: 4, sm: 5 }, textAlign: "center" }}>
      <Chip
        icon={<AutoAwesomeOutlinedIcon sx={{ fontSize: "14px !important" }} />}
        label="ব্র্যান্ড"
        size="small"
        sx={{ mb: 1.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}
        color="primary"
        variant="outlined"
      />
      <Typography variant="h5" fontWeight={700}>
        আমাদের ব্র্যান্ড
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 480 }}>
        বিশ্বস্ত ব্র্যান্ডের মানসম্মত অরিজিনাল পণ্য
      </Typography>
      <Box
        aria-hidden
        sx={{
          mt: 1.5,
          height: 2,
          width: 56,
          borderRadius: 1,
          background: "linear-gradient(90deg, #818cf8, #4f46e5, #8b5cf6)",
        }}
      />
      <Button
        component={Link}
        href="/products"
        variant="outlined"
        endIcon={<ArrowForwardRoundedIcon />}
        sx={{ mt: 2.5, borderRadius: 1 }}
      >
        সব দেখুন
      </Button>
    </Stack>
  );
}

function brandGridSx(count) {
  const cols =
    count === 1
      ? { xs: "1fr" }
      : count === 2
        ? { xs: "repeat(2, 1fr)" }
        : count === 3
          ? { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)" }
          : { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", lg: "repeat(4, 1fr)", xl: "repeat(5, 1fr)" };
  return {
    display: "grid",
    gap: { xs: 1.75, sm: 2 },
    gridTemplateColumns: cols,
    mx: "auto",
    maxWidth: count === 1 ? 200 : count === 2 ? 480 : count === 3 ? 720 : 960,
  };
}

export default function HomeBrandsSection({ brands = [] }) {
  if (brands.length === 0) return null;

  const useGrid = brands.length <= 6;

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        borderTop: 1,
        borderColor: "grey.100",
        bgcolor: "background.paper",
        py: { xs: 5, sm: 6, lg: 7 },
      }}
    >
      <Box
        aria-hidden
        sx={{
          pointerEvents: "none",
          position: "absolute",
          top: -96,
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(100%, 720px)",
          height: 192,
          borderRadius: 1,
          bgcolor: "primary.50",
          filter: "blur(48px)",
          opacity: 0.6,
        }}
      />

      <StoreContainer className="relative">
        <SectionHeader />

        {useGrid ? (
          <Box sx={brandGridSx(brands.length)}>
            {brands.map((brand, index) => (
              <BrandCard key={brand.name} brand={brand} index={index} />
            ))}
          </Box>
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
            className="brands-swiper"
            style={{ overflow: "visible" }}
          >
            {brands.map((brand, index) => (
              <SwiperSlide key={brand.name} style={{ height: "auto" }}>
                <BrandCard brand={brand} index={index} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </StoreContainer>
    </Box>
  );
}
