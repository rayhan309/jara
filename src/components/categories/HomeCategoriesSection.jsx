"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import StoreContainer from "@/components/container/StoreContainer";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import { setSelectedCategoryId } from "@/lib/categoryFilter";
import { useCategories } from "@/hooks/useCategories";
import "swiper/css";

function CategoryCard({ category }) {
  return (
    <Box
      component={Link}
      href={`/products?category=${category.slug}`}
      onClick={() => setSelectedCategoryId(category._id)}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minWidth: 0,
        textDecoration: "none",
        color: "inherit",
        transition: "transform 0.3s ease",
        "&:hover": { transform: "translateY(-4px)" },
        "&:hover .cat-card": {
          borderColor: "primary.main",
          boxShadow: (theme) => `0 12px 28px -12px ${theme.palette.primary.main}88`,
        },
        "&:hover .cat-card-image": {
          transform: "scale(1.08)",
        },
        "&:hover .cat-name": {
          bgcolor: "primary.main",
          color: "primary.contrastText",
          borderColor: "primary.main",
        },
      }}
    >
      <Box
        className="cat-card"
        sx={{
          aspectRatio: "1 / 1",
          width: 1,
          overflow: "hidden",
          borderRadius: "50%",
          border: "3px solid",
          borderColor: "rgba(15,23,42,0.08)",
          bgcolor: "background.paper",
          p: { xs: 0.4, sm: 0.55 },
          boxShadow: "0 8px 20px -14px rgba(15,23,42,0.35)",
          transition: "border-color 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        <Box
          sx={{
            position: "relative",
            height: 1,
            width: 1,
            overflow: "hidden",
            borderRadius: "50%",
            bgcolor: "grey.50",
          }}
        >
          {category.image?.url ? (
            <Image
              className="cat-card-image"
              src={category.image.url}
              alt={category.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 22vw, 120px"
              style={{
                objectFit: "cover",
                transition: "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          ) : (
            <Stack sx={{ height: 1, color: "grey.300", alignItems: "center", justifyContent: "center" }}>
              <LayersOutlinedIcon />
            </Stack>
          )}
        </Box>
      </Box>
      <Typography
        className="cat-name"
        variant="caption"
        fontWeight={700}
        sx={{
          mt: 1.25,
          px: 1.25,
          py: 0.4,
          maxWidth: 1,
          borderRadius: 999,
          border: "1px solid",
          borderColor: "rgba(15,23,42,0.08)",
          bgcolor: "grey.50",
          textAlign: "center",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          transition: "color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease",
        }}
      >
        {category.name}
      </Typography>
    </Box>
  );
}

function CategoryCardSkeleton() {
  return (
    <Stack sx={{ minWidth: 0, alignItems: "center" }}>
      <Skeleton variant="circular" sx={{ width: 1, aspectRatio: "1 / 1", height: "auto" }} />
      <Skeleton width="70%" height={22} sx={{ mt: 1.25, borderRadius: 999 }} />
    </Stack>
  );
}

const SWIPER_BREAKPOINTS = {
  0: { slidesPerView: 4, spaceBetween: 10 },
  480: { slidesPerView: 4, spaceBetween: 12 },
  640: { slidesPerView: 5, spaceBetween: 14 },
  768: { slidesPerView: 6, spaceBetween: 16 },
  1024: { slidesPerView: 7, spaceBetween: 18 },
  1280: { slidesPerView: 8, spaceBetween: 20 },
};

export default function HomeCategoriesSection() {
  const { data: categories = [], isLoading, isError } = useCategories();

  if (isError || (!isLoading && categories.length === 0)) {
    return null;
  }

  return (
    <Box component="section" sx={{ bgcolor: "background.paper", py: { xs: 3.5, sm: 5.5, lg: 6.5 } }}>
      <StoreContainer>
        <Stack sx={{ mb: { xs: 3, sm: 4 }, alignItems: "center" }}>
          <Typography variant="h5" fontWeight={700} sx={{ textAlign: "center" }}>
            Our top categories
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ mt: 1.5, alignItems: "center" }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "primary.light",
              }}
            />
            <Box
              sx={{
                width: 28,
                height: 8,
                borderRadius: 999,
                background: (theme) =>
                  `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
              }}
            />
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "primary.main",
              }}
            />
          </Stack>
        </Stack>

        <Swiper
          modules={[FreeMode]}
          freeMode
          watchOverflow
          breakpoints={SWIPER_BREAKPOINTS}
          className="home-categories-swiper"
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, index) => (
                <SwiperSlide key={index} className="!h-auto">
                  <CategoryCardSkeleton />
                </SwiperSlide>
              ))
            : categories.map((category) => (
                <SwiperSlide key={category._id} className="!h-auto">
                  <CategoryCard category={category} />
                </SwiperSlide>
              ))}
        </Swiper>

        {isLoading ? (
          <Stack direction="row" spacing={1} sx={{ mt: 2.5, color: "text.disabled", alignItems: "center", justifyContent: "center" }}>
            <CircularProgress size={14} color="inherit" />
            <Typography variant="caption">Loading categories...</Typography>
          </Stack>
        ) : null}
      </StoreContainer>
    </Box>
  );
}
