"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import {
  buildCategoryProductCounts,
  filterCategoriesBySearch,
} from "@/lib/categoryHelpers";
import {
  CategoryPageCard,
  CategoryPageCardSkeleton,
} from "@/components/categories/CategoryPageCard";

const SKELETON_COUNT = 10;

export default function StoreCategoriesView() {
  const { data: categories = [], isLoading, isError, error, refetch } = useCategories();
  const { data: products = [] } = useProducts();
  const [search, setSearch] = useState("");

  const productCounts = useMemo(
    () => buildCategoryProductCounts(products, categories),
    [products, categories]
  );

  const filteredCategories = useMemo(
    () => filterCategoriesBySearch(categories, search),
    [categories, search]
  );

  const totalProducts = products.length;

  return (
    <Box>
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 1,
          border: 1,
          borderColor: "primary.100",
          background: "linear-gradient(135deg, #eef2ff 0%, #fff 50%, rgba(237,233,254,0.6) 100%)",
          p: { xs: 2, sm: 3, lg: 3.5 },
        }}
      >
        <Box
          aria-hidden
          sx={{
            pointerEvents: "none",
            position: "absolute",
            top: -40,
            right: -40,
            width: 160,
            height: 160,
            borderRadius: 1,
            bgcolor: "primary.200",
            opacity: 0.3,
            filter: "blur(48px)",
          }}
        />
        <Grid container spacing={3} sx={{ alignItems: "flex-end" }}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <Typography
              variant="caption"
              fontWeight={700}
              color="primary"
              sx={{ letterSpacing: "0.22em", textTransform: "uppercase" }}
            >
              Explore categories
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
              All categories
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 560 }}>
              Browse all categories in a compact grid — pick one and shop.
            </Typography>

            <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap sx={{ mt: 2 }}>
              <Chip
                icon={<LayersOutlinedIcon />}
                label={`${categories.length} categories`}
                size="small"
                sx={{ fontWeight: 600, bgcolor: "rgba(255,255,255,0.9)" }}
              />
              <Chip
                icon={<ShoppingBagOutlinedIcon />}
                label={`${totalProducts} products`}
                size="small"
                sx={{ fontWeight: 600, bgcolor: "rgba(255,255,255,0.9)" }}
              />
              <Chip
                icon={<AutoAwesomeOutlinedIcon />}
                label="New collection"
                size="small"
                sx={{ fontWeight: 600, bgcolor: "rgba(255,255,255,0.9)" }}
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <Stack spacing={1.25}>
              <TextField
                id="category-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search categories..."
                size="small"
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon fontSize="small" color="disabled" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Button
                component={Link}
                href="/products"
                variant="contained"
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{ width: { xs: 1, sm: "auto" } }}
              >
                View all products
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: { xs: 3, sm: 4 } }}>
        <Stack
          direction="row"
          alignItems="flex-end"
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: { xs: 2, sm: 2.5 }, pb: { xs: 1.5, sm: 2 }, borderBottom: 1, borderColor: "divider" }}
        >
          <Box>
            <Typography variant="caption" fontWeight={700} color="primary" sx={{ letterSpacing: "0.2em", textTransform: "uppercase" }}>
              {search.trim() ? "Results" : "Browse"}
            </Typography>
            <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
              {search.trim() ? `Search for "${search.trim()}"` : "All categories"}
            </Typography>
          </Box>
          {!isLoading && !isError ? (
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              {filteredCategories.length}
            </Typography>
          ) : null}
        </Stack>

        {isLoading ? (
          <Box className="store-category-grid">
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <CategoryPageCardSkeleton key={index} />
            ))}
          </Box>
        ) : isError ? (
          <Stack alignItems="center" sx={{ mx: "auto", maxWidth: 420, py: 5, px: 3, textAlign: "center", borderRadius: 1, border: 1, borderColor: "error.light", bgcolor: "error.50" }}>
            <Typography variant="body2" color="error.main">
              {error?.message || "Could not load categories."}
            </Typography>
            <Button startIcon={<RefreshRoundedIcon />} onClick={() => refetch()} sx={{ mt: 2 }}>
              Try again
            </Button>
          </Stack>
        ) : categories.length === 0 ? (
          <Stack alignItems="center" sx={{ mx: "auto", maxWidth: 420, py: 7, px: 3, textAlign: "center", borderRadius: 1, border: 1, borderStyle: "dashed", borderColor: "divider", bgcolor: "background.paper" }}>
            <LayersOutlinedIcon sx={{ fontSize: 36, color: "primary.light" }} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              No categories have been added yet.
            </Typography>
          </Stack>
        ) : filteredCategories.length === 0 ? (
          <Stack alignItems="center" sx={{ py: 7, px: 3, textAlign: "center", borderRadius: 1, border: 1, borderStyle: "dashed", borderColor: "divider", bgcolor: "background.paper" }}>
            <SearchRoundedIcon sx={{ fontSize: 32, color: "grey.300" }} />
            <Typography variant="body2" fontWeight={600} sx={{ mt: 1.5 }}>
              No categories found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Try a different keyword.
            </Typography>
          </Stack>
        ) : (
          <Box className="store-category-grid">
            {filteredCategories.map((category, index) => (
              <CategoryPageCard
                key={category._id}
                category={category}
                productCount={productCounts.get(category._id) || 0}
                index={index}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
