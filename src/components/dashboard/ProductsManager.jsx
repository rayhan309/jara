"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { getProductStockSummary } from "@/lib/variantStock";
import { useCategories } from "@/hooks/useCategories";
import { useDebouncedValue } from "@/hooks/useDebounce";
import { useDeleteProduct, useProducts } from "@/hooks/useProducts";
import { usePagination } from "@/hooks/usePagination";
import TablePagination from "@/components/dashboard/TablePagination";
import DashPageHeader from "@/components/dashboard/DashPageHeader";
import { CardActions } from "@/components/dashboard/DashboardFormUi";

function ProductRowActions({ product, onDelete, isDeleting }) {
  return (
    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
      <IconButton
        component={Link}
        href={`/dashboard/products/${product._id}/edit`}
        aria-label="Edit product"
        title="Edit"
        size="small"
      >
        <EditOutlinedIcon fontSize="small" />
      </IconButton>
      <IconButton
        aria-label="Delete product"
        title="Delete"
        size="small"
        color="error"
        onClick={() => onDelete(product)}
        disabled={isDeleting}
      >
        {isDeleting ? <CircularProgress size={16} /> : <DeleteOutlineRoundedIcon fontSize="small" />}
      </IconButton>
    </Stack>
  );
}

function ProductPriceCell({ product }) {
  const pricing = product.pricing || {};
  const salePrice = pricing.sale_price ?? 0;
  const regularPrice = pricing.regular_price ?? 0;
  const discount = pricing.discount_percentage || 0;
  const hasDiscount = regularPrice > salePrice;

  return (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
      <Typography variant="body2" fontWeight={700} sx={{ fontVariantNumeric: "tabular-nums" }}>
        ৳{salePrice.toLocaleString()}
      </Typography>
      {hasDiscount ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textDecoration: "line-through", fontVariantNumeric: "tabular-nums" }}
        >
          ৳{regularPrice.toLocaleString()}
        </Typography>
      ) : null}
      {discount > 0 ? (
        <Chip size="small" label={`-${discount}%`} color="success" variant="outlined" />
      ) : null}
    </Stack>
  );
}

function ProductStockCell({ product }) {
  const summary = getProductStockSummary(product);

  return (
    <Box>
      <Typography variant="body2" fontWeight={600} sx={{ fontVariantNumeric: "tabular-nums" }}>
        {summary.quantity}
      </Typography>
      {summary.hasVariants || summary.label !== String(summary.quantity) ? (
        <Typography variant="caption" color="text.secondary" display="block">
          {summary.label}
        </Typography>
      ) : null}
    </Box>
  );
}

function ProductThumb({ product, size = 40 }) {
  const mainImage = product.images?.[0]?.url;

  return (
    <Box
      sx={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
        overflow: "hidden",
        borderRadius: 1,
        border: 1,
        borderColor: "divider",
        bgcolor: "grey.50",
      }}
    >
      {mainImage ? (
        <Image
          src={mainImage}
          alt={product.title_bn || product.title_en}
          fill
          unoptimized
          style={{ objectFit: "cover" }}
        />
      ) : (
        <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Inventory2OutlinedIcon sx={{ fontSize: 16, color: "text.disabled" }} />
        </Box>
      )}
    </Box>
  );
}

export default function ProductsManager({ embedded = false }) {
  const router = useRouter();
  const { data: categories = [] } = useCategories();
  const { mutate: deleteProduct, isPending: isDeleting, variables: deletingId } = useDeleteProduct();
  const [searchInput, setSearchInput] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const debouncedSearch = useDebouncedValue(searchInput, 500);

  const {
    data: products = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useProducts({ search: debouncedSearch, category: categoryFilter });

  const { page, setPage, totalPages, totalItems, pageSize, paginatedItems } =
    usePagination(products);

  const isSearching = searchInput !== debouncedSearch || (isFetching && !isLoading);

  function handleDelete(product) {
    if (!window.confirm(`Delete "${product.title_bn || product.title_en}"?`)) return;
    deleteProduct(product._id);
  }

  const addProductLink = (
    <Button
      component={Link}
      href="/dashboard/products/new"
      variant="contained"
      startIcon={<AddRoundedIcon />}
    >
      Add Product
    </Button>
  );

  return (
    <Stack spacing={3}>
      {embedded ? (
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>{addProductLink}</Box>
      ) : (
        <DashPageHeader
          eyebrow="Catalog"
          title="Product Catalog"
          description="Manage regular and variable products with pricing, inventory and images."
          action={addProductLink}
        />
      )}

      <Stack spacing={1.5}>
        <TextField
          fullWidth
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search by name, brand, or slug..."
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: isSearching ? (
                <InputAdornment position="end">
                  <CircularProgress size={18} />
                </InputAdornment>
              ) : null,
            },
          }}
        />

        <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 0.5 }}>
          <Chip
            label="All"
            clickable
            color={categoryFilter === "all" ? "primary" : "default"}
            variant={categoryFilter === "all" ? "filled" : "outlined"}
            onClick={() => setCategoryFilter("all")}
          />
          {categories.map((category) => (
            <Chip
              key={category._id}
              label={category.name}
              clickable
              color={categoryFilter === category._id ? "primary" : "default"}
              variant={categoryFilter === category._id ? "filled" : "outlined"}
              onClick={() => setCategoryFilter(category._id)}
            />
          ))}
        </Stack>
      </Stack>

      {isLoading ? (
        <Paper
          elevation={0}
          sx={{
            minHeight: 280,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: 1,
            borderColor: "divider",
          }}
        >
          <CircularProgress size={32} />
        </Paper>
      ) : isError ? (
        <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: "error.light", bgcolor: "error.50", textAlign: "center" }}>
          <Typography variant="body2" color="error">
            {error?.message || "Failed to load products."}
          </Typography>
          <Button onClick={() => refetch()} sx={{ mt: 1.5 }}>
            Try again
          </Button>
        </Paper>
      ) : products.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            minHeight: 280,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 5,
            textAlign: "center",
            border: 1,
            borderColor: "divider",
          }}
        >
          <Inventory2OutlinedIcon sx={{ fontSize: 40, color: "primary.main", mb: 2 }} />
          <Typography variant="h6" fontWeight={700}>
            {!debouncedSearch && categoryFilter === "all" ? "No products yet" : "No matching products"}
          </Typography>
          {!debouncedSearch && categoryFilter === "all" ? (
            <Box sx={{ mt: 2.5 }}>{addProductLink}</Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try a different search term or category filter.
            </Typography>
          )}
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ overflow: "hidden", border: 1, borderColor: "divider" }}>
          <Box sx={{ display: { xs: "block", lg: "none" } }}>
            {paginatedItems.map((product) => (
              <Box key={product._id} sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
                <Stack direction="row" spacing={1.5}>
                  <ProductThumb product={product} size={56} />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" fontWeight={700} sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {product.title_bn || product.title_en}
                    </Typography>
                    <Chip size="small" label={product.category} sx={{ mt: 1, maxWidth: "100%" }} />
                  </Box>
                </Stack>
                <Stack spacing={1} sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: "divider" }}>
                  <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Typography variant="body2" color="text.secondary">
                      Price
                    </Typography>
                    <ProductPriceCell product={product} />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Typography variant="body2" color="text.secondary">
                      Qty
                    </Typography>
                    <ProductStockCell product={product} />
                  </Stack>
                </Stack>
                <CardActions
                  onEdit={() => router.push(`/dashboard/products/${product._id}/edit`)}
                  onDelete={() => handleDelete(product)}
                  isDeleting={isDeleting && deletingId === product._id}
                />
              </Box>
            ))}
          </Box>

          <Box sx={{ display: { xs: "none", lg: "block" }, overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 68 }}>Image</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedItems.map((product) => (
                  <TableRow key={product._id} hover>
                    <TableCell>
                      <ProductThumb product={product} />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 240 }}>
                      <Typography variant="body2" fontWeight={600} sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {product.title_bn || product.title_en}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={product.category} sx={{ maxWidth: 160 }} />
                    </TableCell>
                    <TableCell>
                      <ProductPriceCell product={product} />
                    </TableCell>
                    <TableCell>
                      <ProductStockCell product={product} />
                    </TableCell>
                    <TableCell align="right">
                      <ProductRowActions
                        product={product}
                        onDelete={handleDelete}
                        isDeleting={isDeleting && deletingId === product._id}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          <TablePagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </Paper>
      )}
    </Stack>
  );
}
