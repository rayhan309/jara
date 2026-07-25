"use client";

import Image from "next/image";
import Link from "next/link";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import { motion } from "motion/react";
import { setSelectedCategoryId } from "@/lib/categoryFilter";

export function CategoryPageCard({ category, productCount = 0, index = 0 }) {
  const hasImage = Boolean(category.image?.url);

  return (
    <Box
      component={motion.article}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-16px" }}
      transition={{ delay: Math.min(index * 0.03, 0.24), duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      sx={{ height: 1, minWidth: 0 }}
    >
      <Box
        component={Link}
        href={`/products?category=${category.slug}`}
        onClick={() => setSelectedCategoryId(category._id)}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.25,
          height: 1,
          textDecoration: "none",
          color: "inherit",
          "&:hover .cat-page-image": {
            transform: "scale(1.06)",
          },
          "&:hover .cat-page-media": {
            borderColor: "rgba(15,23,42,0.14)",
            boxShadow: "0 14px 32px -18px rgba(15,23,42,0.28)",
          },
          "&:hover .cat-page-name": {
            color: "primary.main",
          },
        }}
      >
        <Box
          className="cat-page-media rounded-md"
          sx={{
            position: "relative",
            aspectRatio: "1 / 1",
            width: 1,
            overflow: "hidden",
            borderRadius: 1.5,
            border: 1,
            borderColor: "rgba(15,23,42,0.08)",
            bgcolor: "grey.50",
            boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
            transition: "border-color 0.3s ease, box-shadow 0.3s ease",
          }}
        >
          {hasImage ? (
            <Image
              className="cat-page-image"
              src={category.image.url}
              alt={category.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 45vw, 120px"
              style={{
                objectFit: "cover",
                objectPosition: "center",
                transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          ) : (
            <Stack
              sx={{
                height: 1,
                width: 1,
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(145deg, #f8f4f2 0%, #efe4df 100%)",
              }}
            >
              <LayersOutlinedIcon sx={{ fontSize: { xs: 28, sm: 32 }, color: "primary.light" }} />
            </Stack>
          )}

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(9,9,11,0.55) 0%, transparent 50%)",
              opacity: 0.85,
              pointerEvents: "none",
            }}
          />

          <Chip
            label={productCount}
            size="small"
            sx={{
              position: "absolute",
              top: { xs: 6, sm: 8 },
              right: { xs: 6, sm: 8 },
              height: 22,
              fontSize: { xs: 10, sm: 11 },
              fontWeight: 700,
              bgcolor: "rgba(255,255,255,0.95)",
              color: "text.primary",
              backdropFilter: "blur(4px)",
              boxShadow: "0 2px 8px rgba(15,23,42,0.1)",
            }}
          />
        </Box>

        <Stack sx={{ minWidth: 0, px: 0.25, textAlign: "center", alignItems: "center" }}>
          <Typography
            className="cat-page-name"
            variant="caption"
            fontWeight={600}
            color="text.primary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.35,
              transition: "color 0.2s ease",
            }}
          >
            {category.name}
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ mt: 0.25 }}>
            {productCount} products
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}

export function CategoryPageCardSkeleton() {
  return (
    <Stack spacing={1}>
      <Skeleton variant="rounded" sx={{ aspectRatio: "1 / 1", width: 1, borderRadius: 1.5 }} />
      <Skeleton width="75%" height={12} sx={{ mx: "auto" }} />
      <Skeleton width="50%" height={10} sx={{ mx: "auto" }} />
    </Stack>
  );
}
