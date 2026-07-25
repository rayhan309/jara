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
            borderColor: "rgba(15,23,42,0.14)",
            boxShadow: "0 16px 36px -18px rgba(15,23,42,0.28)",
          },
          "&:hover .cat-tile-image": {
            transform: "scale(1.06)",
          },
          "&:hover .cat-tile-name": {
            color: "primary.main",
          },
        }}
      >
        <Box
          className="cat-tile-media rounded-md"
          sx={{
            position: "relative",
            aspectRatio: "1 / 1",
            width: 1,
            overflow: "hidden",
            borderRadius: 1.5,
            border: 1,
            borderColor: "rgba(15,23,42,0.08)",
            bgcolor: "background.paper",
            p: { xs: 2, sm: 2.5 },
            boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
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
          fontWeight={600}
          color="text.primary"
          sx={{
            minHeight: "2.5rem",
            width: 1,
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
    </Box>
  );
}

export function CategoryTileSkeleton() {
  return (
    <Stack spacing={1.5} sx={{ alignItems: "center" }}>
      <Skeleton variant="rounded" sx={{ aspectRatio: "1 / 1", width: 1, borderRadius: 1.5 }} />
      <Skeleton width="60%" height={14} />
    </Stack>
  );
}
