"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import StoreContainer from "@/components/container/StoreContainer";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { setSelectedCategoryId } from "@/lib/categoryFilter";
import StoreProductCard from "@/components/products/StoreProductCard";

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
    <Box sx={{ overflow: "hidden", borderRadius: 1, border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
      <Skeleton variant="rectangular" sx={{ aspectRatio: "1 / 1", width: 1 }} />
      <Stack spacing={1} sx={{ px: 1.25, py: 1 }}>
        <Skeleton height={12} />
        <Skeleton width="70%" height={12} />
        <Skeleton width={64} height={16} />
      </Stack>
    </Box>
  );
}

function CategoryBlockSkeleton() {
  return (
    <Box component="section" sx={{ py: { xs: 3, sm: 4 } }}>
      <Skeleton width={160} height={28} sx={{ mx: "auto", mb: 2.5 }} />
      <Box sx={productGridSx}>
        {Array.from({ length: 4 }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </Box>
    </Box>
  );
}

export default function HomeCategoryProductsSection({
  category,
  products,
  totalCount,
  index = 0,
}) {
  const hasMore = totalCount > products.length;

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 3, sm: 4 },
        bgcolor: index % 2 === 1 ? "grey.50" : "background.paper",
      }}
    >
      <StoreContainer>
        <Stack sx={{ mb: { xs: 2, sm: 2.5 }, alignItems: "center" }}>
          <Typography variant="h5" fontWeight={700} sx={{ textAlign: "center" }}>
            {category.name}
          </Typography>
          <Box
            sx={{
              mt: 1,
              width: 40,
              height: 3,
              borderRadius: 1,
              background: (theme) =>
                `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            }}
          />
          {hasMore ? (
            <Button
              component={Link}
              href={`/products?category=${category.slug}`}
              onClick={() => setSelectedCategoryId(category._id)}
              endIcon={<ArrowForwardRoundedIcon />}
              size="small"
              sx={{ mt: 1.5 }}
            >
              View all
            </Button>
          ) : null}
        </Stack>

        <Box sx={productGridSx}>
          {products.map((product, productIndex) => (
            <StoreProductCard key={product._id} product={product} index={productIndex} />
          ))}
        </Box>
      </StoreContainer>
    </Box>
  );
}

export { CategoryBlockSkeleton };
