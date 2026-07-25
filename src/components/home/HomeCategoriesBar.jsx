"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import StoreContainer from "@/components/container/StoreContainer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useCategories } from "@/hooks/useCategories";
import { setSelectedCategoryId } from "@/lib/categoryFilter";

export default function HomeCategoriesBar() {
  const pathname = usePathname();
  const { data: categories = [], isLoading } = useCategories();
  const isHome = pathname === "/";

  if (!isHome) return null;

  return (
    <Box
      component="nav"
      aria-label="Category menu"
      sx={{ borderBottom: 1, borderColor: "primary.dark", bgcolor: "primary.main", color: "primary.contrastText" }}
    >
      <StoreContainer>
        <Stack
          direction="row"
          alignItems="center"
          spacing={{ xs: 0.5, sm: 0.75 }}
          sx={{
            overflowX: "auto",
            py: 1,
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <Button
            component={Link}
            href="/"
            size="small"
            sx={{
              flexShrink: 0,
              bgcolor: "primary.dark",
              color: "inherit",
              fontWeight: 600,
              "&:hover": { bgcolor: "primary.light" },
            }}
          >
            Home
          </Button>

          {isLoading ? (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0, px: 1.5, py: 0.75 }}>
              <CircularProgress size={14} color="inherit" sx={{ opacity: 0.7 }} />
              <Typography variant="caption" sx={{ color: "primary.100" }}>
                Loading...
              </Typography>
            </Stack>
          ) : (
            categories.map((category) => (
              <Button
                key={category._id}
                component={Link}
                href={`/products?category=${category.slug}`}
                onClick={() => setSelectedCategoryId(category._id)}
                size="small"
                sx={{
                  flexShrink: 0,
                  color: "primary.50",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.12)", color: "common.white" },
                }}
              >
                {category.name}
              </Button>
            ))
          )}

          {!isLoading && categories.length > 0 ? (
            <Button
              component={Link}
              href="/categories"
              size="small"
              variant="outlined"
              sx={{
                ml: "auto",
                flexShrink: 0,
                borderColor: "rgba(255,255,255,0.5)",
                color: "primary.100",
                fontWeight: 600,
                whiteSpace: "nowrap",
                "&:hover": { borderColor: "common.white", bgcolor: "rgba(255,255,255,0.1)" },
              }}
            >
              All categories
            </Button>
          ) : null}
        </Stack>
      </StoreContainer>
    </Box>
  );
}
