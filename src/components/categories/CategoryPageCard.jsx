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
      whileHover={{ y: -4 }}
      sx={{ height: 1, minWidth: 0 }}
    >
      <Box
        component={Link}
        href={`/products?category=${category.slug}`}
        onClick={() => setSelectedCategoryId(category._id)}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1.25,
          height: 1,
          textDecoration: "none",
          color: "inherit",
          "&:hover .cat-page-image": {
            transform: "scale(1.08)",
          },
          "&:hover .cat-page-media": {
            borderColor: "primary.main",
            boxShadow: (theme) => `0 14px 28px -12px ${theme.palette.primary.main}88`,
          },
          "&:hover .cat-page-name": {
            bgcolor: "primary.main",
            color: "primary.contrastText",
            borderColor: "primary.main",
          },
        }}
      >
        <Box
          className="cat-page-media"
          sx={{
            position: "relative",
            aspectRatio: "1 / 1",
            width: 1,
            overflow: "visible",
            borderRadius: "50%",
            border: "3px solid",
            borderColor: "rgba(15,23,42,0.08)",
            bgcolor: "grey.50",
            p: 0.45,
            boxShadow: "0 8px 20px -14px rgba(15,23,42,0.35)",
            transition: "border-color 0.3s ease, box-shadow 0.3s ease",
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: 1,
              height: 1,
              overflow: "hidden",
              borderRadius: "50%",
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
          </Box>

          <Chip
            label={productCount}
            size="small"
            sx={{
              position: "absolute",
              top: { xs: 2, sm: 4 },
              right: { xs: 2, sm: 4 },
              height: 22,
              minWidth: 22,
              fontSize: { xs: 10, sm: 11 },
              fontWeight: 700,
              borderRadius: 999,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              boxShadow: "0 4px 10px rgba(15,23,42,0.18)",
            }}
          />
        </Box>

        <Stack sx={{ minWidth: 0, width: 1, px: 0.25, textAlign: "center", alignItems: "center" }}>
          <Typography
            className="cat-page-name"
            variant="caption"
            fontWeight={700}
            color="text.primary"
            sx={{
              px: 1.25,
              py: 0.4,
              maxWidth: 1,
              borderRadius: 999,
              border: "1px solid",
              borderColor: "rgba(15,23,42,0.08)",
              bgcolor: "grey.50",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.35,
              transition: "color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease",
            }}
          >
            {category.name}
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5 }}>
            {productCount}টি পণ্য
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}

export function CategoryPageCardSkeleton() {
  return (
    <Stack spacing={1.25} sx={{ alignItems: "center" }}>
      <Skeleton variant="circular" sx={{ aspectRatio: "1 / 1", width: 1, height: "auto" }} />
      <Skeleton width="75%" height={22} sx={{ borderRadius: 999 }} />
      <Skeleton width="50%" height={10} />
    </Stack>
  );
}
