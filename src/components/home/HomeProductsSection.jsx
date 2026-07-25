"use client";

import Box from "@mui/material/Box";
import StoreContainer from "@/components/container/StoreContainer";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { motion } from "motion/react";
import StoreProductCard from "@/components/products/StoreProductCard";
import HomeSectionHeader from "@/components/home/HomeSectionHeader";

const productGridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "repeat(2, minmax(0, 1fr))",
    sm: "repeat(3, minmax(0, 1fr))",
    md: "repeat(4, minmax(0, 1fr))",
    lg: "repeat(5, minmax(0, 1fr))",
  },
  gap: { xs: 1.5, sm: 2 },
};

function ProductSkeleton() {
  return (
    <Box>
      <Skeleton variant="rounded" sx={{ aspectRatio: "4 / 5", width: 1, borderRadius: 1.5, bgcolor: "#f3f0ee" }} />
      <Stack spacing={0.75} sx={{ pt: 1.5, px: 0.25 }}>
        <Skeleton height={12} />
        <Skeleton width="70%" height={12} />
        <Skeleton width={64} height={16} />
      </Stack>
    </Box>
  );
}

export default function HomeProductsSection({
  eyebrow,
  title,
  subtitle,
  href,
  products = [],
  isLoading = false,
  emptyMessage = "No products yet.",
  className = "",
}) {
  return (
    <Box component="section" className={className} sx={{ py: { xs: 4, sm: 6, lg: 7 } }}>
      <StoreContainer>
        <HomeSectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} href={href} />

        {isLoading ? (
          <Box sx={productGridSx}>
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </Box>
        ) : products.length === 0 ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
              minHeight: 200,
              borderRadius: 1,
              border: 1,
              borderStyle: "dashed",
              borderColor: "divider",
              bgcolor: "background.paper",
              p: 4,
              textAlign: "center",
              boxShadow: 1,
            }}
          >
            <Inventory2OutlinedIcon sx={{ mb: 1.5, fontSize: 36, color: "primary.light" }} />
            <Typography variant="body2" color="text.secondary">
              {emptyMessage}
            </Typography>
          </Stack>
        ) : (
          <Box sx={productGridSx}>
            {products.map((product, index) => (
              <Box
                key={product._id}
                component={motion.div}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: Math.min(index * 0.03, 0.24) }}
                sx={{ minWidth: 0 }}
              >
                <StoreProductCard product={product} index={index} />
              </Box>
            ))}
          </Box>
        )}
      </StoreContainer>
    </Box>
  );
}
