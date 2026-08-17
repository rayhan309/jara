"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { filterProductsByCategory } from "@/lib/categoryFilter";
import { filterProductsBySearch } from "@/lib/productSearch";
import { useCategoryFilter } from "@/hooks/useCategoryFilter";
import { usePagination } from "@/hooks/usePagination";
import { useProducts } from "@/hooks/useProducts";
import StoreProductCard from "@/components/products/StoreProductCard";

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

export default function StoreProductsView() {
  return (
    <Suspense fallback={<StoreProductsFallback />}>
      <StoreProductsContent />
    </Suspense>
  );
}

function StoreProductsFallback() {
  return (
    <Box>
      <Stack alignItems="center">
        <Skeleton width={160} height={32} />
        <Skeleton width={48} height={4} sx={{ mt: 1 }} />
      </Stack>
      <Box sx={{ ...productGridSx, mt: { xs: 3, sm: 4 } }}>
        {Array.from({ length: 15 }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </Box>
    </Box>
  );
}

function StoreProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q")?.trim() || "";

  const {
    isLoading: categoriesLoading,
    selectedCategory,
    selectCategory,
  } = useCategoryFilter();

  const { data: products = [], isLoading, isError, error, refetch } = useProducts();

  const filteredProducts = useMemo(() => {
    const byCategory = filterProductsByCategory(products, selectedCategory);
    return filterProductsBySearch(byCategory, searchQuery);
  }, [products, selectedCategory, searchQuery]);

  const { page, setPage, totalPages, totalItems, pageSize, paginatedItems } =
    usePagination(filteredProducts, 15);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const pageTitle = searchQuery
    ? `"${searchQuery}" — সার্চ`
    : selectedCategory
      ? selectedCategory.name
      : "সব পণ্য";
  const isLoadingContent = isLoading || categoriesLoading;

  function handleShowAllProducts() {
    selectCategory(null);
    router.push("/products");
  }

  return (
    <Box>
      <Stack sx={{ alignItems: "center" }}>
        <Typography variant="h5" fontWeight={700} sx={{ textAlign: "center" }}>
          {pageTitle}
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
      </Stack>

      <Box sx={{ mt: { xs: 3, sm: 4 } }}>
        {isLoadingContent ? (
          <Box sx={productGridSx}>
            {Array.from({ length: 12 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </Box>
        ) : isError ? (
          <Box sx={{ border: 1, borderColor: "error.light", bgcolor: "error.50", borderRadius: 1, p: 4, textAlign: "center" }}>
            <Typography variant="body2" color="error.main">
              {error?.message || "পণ্য লোড করা যায়নি।"}
            </Typography>
            <Button onClick={() => refetch()} sx={{ mt: 1.5 }}>
              আবার চেষ্টা করুন
            </Button>
          </Box>
        ) : filteredProducts.length === 0 ? (
          <Box sx={{ border: "1px dashed", borderColor: "divider", bgcolor: "background.paper", borderRadius: 1, px: 3, py: 8, textAlign: "center" }}>
            <Inventory2OutlinedIcon sx={{ fontSize: 40, color: "grey.300" }} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {searchQuery
                ? `"${searchQuery}" এর জন্য কোনো পণ্য পাওয়া যায়নি।`
                : selectedCategory
                  ? `"${selectedCategory.name}"-এ এখনো পণ্য নেই।`
                  : "এখনো কোনো পণ্য যোগ করা হয়নি।"}
            </Typography>
            {searchQuery || selectedCategory ? (
              <Button onClick={handleShowAllProducts} sx={{ mt: 2 }}>
                সব পণ্য দেখুন
              </Button>
            ) : null}
          </Box>
        ) : (
          <Box sx={productGridSx}>
            {paginatedItems.map((product, index) => (
              <StoreProductCard key={product._id} product={product} index={index} />
            ))}
          </Box>
        )}
      </Box>

      {!isLoadingContent && !isError && totalItems > pageSize ? (
        <Stack alignItems="center" sx={{ mt: 4 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ border: 1, borderColor: "divider", bgcolor: "background.paper", borderRadius: 1, px: 1.5, py: 1 }}
          >
            <IconButton size="small" onClick={() => setPage(page - 1)} disabled={page <= 1} aria-label="আগের পেজ">
              <ChevronLeftRoundedIcon fontSize="small" />
            </IconButton>
            <Typography variant="caption" fontWeight={600} sx={{ minWidth: 86, textAlign: "center" }}>
              পেজ {page} / {totalPages}
            </Typography>
            <IconButton size="small" onClick={() => setPage(page + 1)} disabled={page >= totalPages} aria-label="পরের পেজ">
              <ChevronRightRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      ) : null}
    </Box>
  );
}
