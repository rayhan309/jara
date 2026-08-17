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
          borderRadius: 5,
          border: 1,
          borderColor: "primary.100",
          background: "linear-gradient(135deg, #eef2ff 0%, #fff 50%, rgba(237,233,254,0.6) 100%)",
          p: { xs: 2.25, sm: 3.25, lg: 3.75 },
        }}
      >
        <Box
          aria-hidden
          sx={{
            pointerEvents: "none",
            position: "absolute",
            top: -48,
            right: -36,
            width: 180,
            height: 180,
            borderRadius: "50%",
            bgcolor: "primary.200",
            opacity: 0.35,
            filter: "blur(36px)",
          }}
        />
        <Box
          aria-hidden
          sx={{
            pointerEvents: "none",
            position: "absolute",
            bottom: -28,
            left: -20,
            width: 90,
            height: 90,
            borderRadius: "50%",
            bgcolor: "primary.100",
            opacity: 0.7,
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
              ক্যাটাগরি দেখুন
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
              সব ক্যাটাগরি
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 560 }}>
              সব ক্যাটাগরি গ্রিডে দেখুন — একটি বেছে নিয়ে কিনুন।
            </Typography>

            <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap sx={{ mt: 2 }}>
              <Chip
                icon={<LayersOutlinedIcon />}
                label={`${categories.length}টি ক্যাটাগরি`}
                size="small"
                sx={{ fontWeight: 600, bgcolor: "rgba(255,255,255,0.9)", borderRadius: 999 }}
              />
              <Chip
                icon={<ShoppingBagOutlinedIcon />}
                label={`${totalProducts}টি পণ্য`}
                size="small"
                sx={{ fontWeight: 600, bgcolor: "rgba(255,255,255,0.9)", borderRadius: 999 }}
              />
              <Chip
                icon={<AutoAwesomeOutlinedIcon />}
                label="নতুন কালেকশন"
                size="small"
                sx={{ fontWeight: 600, bgcolor: "rgba(255,255,255,0.9)", borderRadius: 999 }}
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
                placeholder="ক্যাটাগরি খুঁজুন..."
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
                sx={{ width: { xs: 1, sm: "auto" }, borderRadius: 999 }}
              >
                সব পণ্য দেখুন
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
              {search.trim() ? "ফলাফল" : "ব্রাউজ"}
            </Typography>
            <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
              {search.trim() ? `"${search.trim()}" এর সার্চ` : "সব ক্যাটাগরি"}
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
              {error?.message || "ক্যাটাগরি লোড করা যায়নি।"}
            </Typography>
            <Button startIcon={<RefreshRoundedIcon />} onClick={() => refetch()} sx={{ mt: 2 }}>
              আবার চেষ্টা করুন
            </Button>
          </Stack>
        ) : categories.length === 0 ? (
          <Stack alignItems="center" sx={{ mx: "auto", maxWidth: 420, py: 7, px: 3, textAlign: "center", borderRadius: 1, border: 1, borderStyle: "dashed", borderColor: "divider", bgcolor: "background.paper" }}>
            <LayersOutlinedIcon sx={{ fontSize: 36, color: "primary.light" }} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              এখনো কোনো ক্যাটাগরি যোগ করা হয়নি।
            </Typography>
          </Stack>
        ) : filteredCategories.length === 0 ? (
          <Stack alignItems="center" sx={{ py: 7, px: 3, textAlign: "center", borderRadius: 1, border: 1, borderStyle: "dashed", borderColor: "divider", bgcolor: "background.paper" }}>
            <SearchRoundedIcon sx={{ fontSize: 32, color: "grey.300" }} />
            <Typography variant="body2" fontWeight={600} sx={{ mt: 1.5 }}>
              কোনো ক্যাটাগরি পাওয়া যায়নি
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              অন্য কিওয়ার্ড দিয়ে চেষ্টা করুন।
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
