"use client";

import Image from "next/image";
import Link from "next/link";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import { motion } from "motion/react";
import { setSelectedCategoryId } from "@/lib/categoryFilter";

export function CategoryTile({ category, index = 0 }) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-16px" }}
      transition={{ delay: Math.min(index * 0.035, 0.28), duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      sx={{ height: 1 }}
    >
      <Box
        component={Link}
        href={`/products?category=${category.slug}`}
        onClick={() => setSelectedCategoryId(category._id)}
        sx={{
          display: "flex",
          flexDirection: "column",
          height: 1,
          textDecoration: "none",
          color: "inherit",
          alignItems: "center",
          gap: { xs: 1.5, sm: 1.75 },
          "&:hover .cat-tile-media": {
            borderColor: "primary.main",
            boxShadow: (theme) => `0 16px 32px -14px ${theme.palette.primary.main}88`,
          },
          "&:hover .cat-tile-image": {
            transform: "scale(1.08)",
          },
          "&:hover .cat-tile-name": {
            bgcolor: "primary.main",
            color: "primary.contrastText",
            borderColor: "primary.main",
          },
        }}
      >
        <Box
          className="cat-tile-media"
          sx={{
            position: "relative",
            aspectRatio: "1 / 1",
            width: 1,
            overflow: "hidden",
            borderRadius: "50%",
            border: "3px solid",
            borderColor: "rgba(15,23,42,0.08)",
            bgcolor: "background.paper",
            p: { xs: 1.5, sm: 2 },
            boxShadow: "0 8px 20px -14px rgba(15,23,42,0.35)",
            transition: "border-color 0.3s ease, box-shadow 0.3s ease",
          }}
        >
          <Stack
            sx={{
              position: "relative",
              height: 1,
              width: 1,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              overflow: "hidden",
            }}
          >
            {category.image?.url ? (
              <Image
                className="cat-tile-image"
                src={category.image.url}
                alt={category.name}
                width={160}
                height={160}
                unoptimized
                style={{
                  maxHeight: "100%",
                  maxWidth: "100%",
                  objectFit: "contain",
                  transition: "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              />
            ) : (
              <LayersOutlinedIcon sx={{ fontSize: 40, color: "grey.300" }} />
            )}
          </Stack>
        </Box>

        <Typography
          className="cat-tile-name"
          variant="body2"
          fontWeight={700}
          color="text.primary"
          sx={{
            minHeight: "2.25rem",
            width: "fit-content",
            maxWidth: 1,
            px: 1.5,
            py: 0.4,
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
    </Box>
  );
}

export function CategoryTileSkeleton() {
  return (
    <Stack spacing={1.5} sx={{ alignItems: "center" }}>
      <Skeleton variant="circular" sx={{ aspectRatio: "1 / 1", width: 1, height: "auto" }} />
      <Skeleton width="60%" height={22} sx={{ borderRadius: 999 }} />
    </Stack>
  );
}
