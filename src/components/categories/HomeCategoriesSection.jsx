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
        display: "block",
        minWidth: 0,
        textDecoration: "none",
        color: "inherit",
        transition: "transform 0.3s ease",
        "&:hover": { transform: "translateY(-3px)" },
        "&:hover .cat-card": {
          borderColor: "rgba(15,23,42,0.14)",
          boxShadow: "0 14px 32px -16px rgba(15,23,42,0.28)",
        },
        "&:hover .cat-card-image": {
          transform: "scale(1.06)",
        },
        "&:hover .cat-name": { color: "primary.main" },
      }}
    >
      <Box
        className="cat-card rounded-md"
        sx={{
          aspectRatio: "1 / 1",
          overflow: "hidden",
          borderRadius: 1.5,
          border: 1,
          borderColor: "rgba(15,23,42,0.08)",
          bgcolor: "background.paper",
          p: { xs: 0.75, sm: 1 },
          boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
          transition: "border-color 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        <Box
          className="rounded-md"
          sx={{
            position: "relative",
            height: 1,
            width: 1,
            overflow: "hidden",
            borderRadius: 1,
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
        variant="body2"
        fontWeight={600}
        sx={{
          mt: 1.5,
          px: 0.5,
          textAlign: "center",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          transition: "color 0.2s ease",
        }}
      >
        {category.name}
      </Typography>
    </Box>
  );
}

function CategoryCardSkeleton() {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Skeleton variant="rounded" className="rounded-md" sx={{ width: 1, aspectRatio: "1 / 1", height: "auto", borderRadius: 1 }} />
      <Skeleton width="75%" height={12} sx={{ mx: "auto", mt: 1 }} />
    </Box>
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
    <Box component="section" sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.paper", py: { xs: 3, sm: 5, lg: 6 } }}>
      <StoreContainer>
        <Stack sx={{ mb: { xs: 3, sm: 4 }, alignItems: "center" }}>
          <Typography variant="h5" fontWeight={700} sx={{ textAlign: "center" }}>
            Our top categories
          </Typography>
          <Box
            className="rounded-md"
            sx={{
              mt: 1.5,
              width: 56,
              height: 4,
              borderRadius: 1,
              background: (theme) =>
                `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            }}
          />
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
