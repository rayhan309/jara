"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StoreContainer from "@/components/container/StoreContainer";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AddShoppingCartRoundedIcon from "@mui/icons-material/AddShoppingCartRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalMallRoundedIcon from "@mui/icons-material/LocalMallRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { getProductMaxStock } from "@/lib/cart";
import { getProductVariantConfig } from "@/lib/productVariants";
import { resolveProductPricing } from "@/lib/productPricing";
import { isProductFullyOutOfStock, isVariantOutOfStock } from "@/lib/variantStock";
import StoreProductCard from "@/components/products/StoreProductCard";
import { buildProductPixelPayload, trackMetaEvent } from "@/lib/metaPixel";
import { SITE_NAME } from "@/lib/siteMetadata";

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

function RatingStars({ rating }) {
  const value = Math.min(5, Math.max(0, rating || 0));

  return (
    <Stack direction="row" spacing={0.25}>
      {Array.from({ length: 5 }).map((_, index) => (
        <StarRoundedIcon
          key={index}
          sx={{
            fontSize: 18,
            color: index < Math.round(value) ? "warning.main" : "grey.200",
          }}
        />
      ))}
    </Stack>
  );
}

export default function StoreProductDetailView({ product, relatedProducts = [] }) {
  const router = useRouter();
  const { addToCart, buyNow, removeFromCart, items } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState("");

  const variantConfig = useMemo(() => getProductVariantConfig(product), [product]);
  const productCartLines = useMemo(
    () => items.filter((item) => item._id === product._id),
    [items, product._id]
  );
  const images = product.images?.length ? product.images : [];
  const title = product.title_bn || product.title_en;
  const activePricing = useMemo(
    () => resolveProductPricing(product, selectedVariant),
    [product, selectedVariant]
  );
  const salePrice = activePricing.sale_price || 0;
  const regularPrice = activePricing.regular_price || 0;
  const discount = activePricing.discount_percentage || 0;
  const outOfStock = variantConfig.required
    ? selectedVariant
      ? isVariantOutOfStock(product, selectedVariant)
      : isProductFullyOutOfStock(product)
    : isVariantOutOfStock(product);
  const maxStock = getProductMaxStock(product, selectedVariant);
  const cartLine = items.find(
    (item) =>
      item._id === product._id && (item.selected_variant || "") === (selectedVariant || "")
  );
  const inCart = Boolean(cartLine);
  const cartQty = cartLine?.quantity || 0;
  const remainingStock = Math.max(0, maxStock - cartQty);
  const wishlisted = isInWishlist(product._id, selectedVariant);

  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant]);

  useEffect(() => {
    setQuantity((current) => {
      const limit = Math.max(1, remainingStock || 1);
      return Math.min(limit, Math.max(1, current));
    });
  }, [remainingStock]);

  useEffect(() => {
    if (productCartLines.length === 0) return;

    if (variantConfig.required && !selectedVariant) {
      const variantInCart = productCartLines[0]?.selected_variant;
      if (variantInCart) setSelectedVariant(variantInCart);
    }
  }, [productCartLines, variantConfig.required, selectedVariant]);

  useEffect(() => {
    if (inCart) {
      setQuantity(cartQty);
    } else if (!variantConfig.required && productCartLines.length === 0) {
      setQuantity(1);
    }
  }, [selectedVariant, inCart, cartQty, variantConfig.required, productCartLines.length]);

  useEffect(() => {
    trackMetaEvent("ViewContent", buildProductPixelPayload(product, 1));
  }, [product._id]);

  function clampQty(value) {
    const limit = Math.max(1, remainingStock || 1);
    return Math.min(limit, Math.max(1, value));
  }

  function handleAddToCart() {
    if (outOfStock) {
      toast.error("This product is out of stock");
      return;
    }
    if (variantConfig.required && !selectedVariant) {
      toast.error(`Please select ${variantConfig.label}`);
      return;
    }
    if (inCart) {
      removeFromCart(product._id, title, selectedVariant);
      return;
    }
    if (remainingStock === 0) {
      toast.error("Cannot add more — stock limit reached");
      return;
    }
    addToCart(product, quantity, selectedVariant);
    trackMetaEvent("AddToCart", buildProductPixelPayload(product, quantity));
  }

  function handleBuy() {
    if (outOfStock) {
      toast.error("This product is out of stock");
      return;
    }
    if (variantConfig.required && !selectedVariant) {
      toast.error(`Please select ${variantConfig.label}`);
      return;
    }
    if (inCart) {
      router.push("/checkout");
      return;
    }
    if (remainingStock === 0) {
      toast.error("Cannot add more — stock limit reached");
      return;
    }
    buyNow(product, quantity, selectedVariant);
    trackMetaEvent("AddToCart", buildProductPixelPayload(product, quantity));
  }

  function increaseQuantity() {
    if (remainingStock === 0) {
      toast.error("Cannot add more — stock limit reached");
      return;
    }
    if (quantity >= remainingStock) {
      toast.error(`You can add up to ${remainingStock} more`);
      return;
    }
    setQuantity((q) => clampQty(q + 1));
  }

  function handleWishlistToggle() {
    toggleWishlist(product, selectedVariant);
  }

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareText = `${title} — ৳${salePrice.toLocaleString()} | ${SITE_NAME}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url });
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Product link copied");
    } catch {
      toast.error("Could not share");
    }
  }

  const trustFeatures = [
    { icon: LocalShippingOutlinedIcon, label: "Fast delivery" },
    { icon: VerifiedUserOutlinedIcon, label: "Safe shopping" },
    { icon: Inventory2OutlinedIcon, label: "Quality products" },
  ];

  return (
    <StoreContainer className="py-6 sm:py-10">
      <Breadcrumbs
        separator={<ChevronRightRoundedIcon sx={{ fontSize: 16 }} />}
        sx={{ mb: 3, typography: "caption", color: "text.secondary" }}
      >
        <Typography component={Link} href="/" color="inherit" sx={{ textDecoration: "none", "&:hover": { color: "primary.main" } }}>
          Home
        </Typography>
        <Typography component={Link} href="/products" color="inherit" sx={{ textDecoration: "none", "&:hover": { color: "primary.main" } }}>
          Products
        </Typography>
        {product.category ? (
          <Typography
            component={Link}
            href={`/products?category=${product.category_slug || ""}`}
            color="inherit"
            sx={{ textDecoration: "none", "&:hover": { color: "primary.main" } }}
          >
            {product.category}
          </Typography>
        ) : null}
        <Typography color="text.primary" fontWeight={500} noWrap sx={{ maxWidth: 200 }}>
          {title}
        </Typography>
      </Breadcrumbs>

      <Grid container spacing={{ xs: 4, lg: 6 }} sx={{ alignItems: "flex-start" }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box sx={{ position: { lg: "sticky" }, top: { lg: 96 } }}>
            <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
              <Paper variant="outlined" sx={{ position: "relative", overflow: "hidden" }}>
                <Box sx={{ position: "relative", aspectRatio: "1 / 1", bgcolor: "grey.50", p: { xs: 2, sm: 3 } }}>
                  {images[activeImage]?.url ? (
                    <Image
                      src={images[activeImage].url}
                      alt={title}
                      fill
                      unoptimized
                      priority
                      style={{ objectFit: "contain", objectPosition: "center" }}
                    />
                  ) : (
                    <Stack alignItems="center" justifyContent="center" sx={{ height: 1, color: "grey.300" }}>
                      <Inventory2OutlinedIcon sx={{ fontSize: 64 }} />
                    </Stack>
                  )}
                </Box>

                {discount > 0 ? (
                  <Chip
                    label={`-${discount}% off`}
                    color="error"
                    size="small"
                    sx={{ position: "absolute", top: 16, left: 16, fontWeight: 700 }}
                  />
                ) : null}

                {outOfStock ? (
                  <Chip
                    label="Out of stock"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: discount > 0 ? 52 : 16,
                      left: 16,
                      bgcolor: "grey.800",
                      color: "common.white",
                      fontWeight: 600,
                    }}
                  />
                ) : null}

                <Stack direction="row" spacing={0.5} sx={{ position: "absolute", top: 16, right: 16 }}>
                  <IconButton
                    size="small"
                    aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    onClick={handleWishlistToggle}
                    sx={{ bgcolor: "rgba(255,255,255,0.95)", border: 1, borderColor: "divider" }}
                  >
                    {wishlisted ? (
                      <FavoriteRoundedIcon fontSize="small" color="error" />
                    ) : (
                      <FavoriteBorderRoundedIcon fontSize="small" />
                    )}
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label="Share"
                    onClick={handleShare}
                    sx={{ bgcolor: "rgba(255,255,255,0.95)", border: 1, borderColor: "divider" }}
                  >
                    <ShareOutlinedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Paper>

              {images.length > 1 ? (
                <Stack direction="row" spacing={1} sx={{ mt: 2, overflowX: "auto", pb: 0.5 }}>
                  {images.map((image, index) => (
                    <IconButton
                      key={image.fileId || image.url || index}
                      onClick={() => setActiveImage(index)}
                      sx={{
                        position: "relative",
                        width: { xs: 64, sm: 80 },
                        height: { xs: 64, sm: 80 },
                        flexShrink: 0,
                        borderRadius: 1,
                        border: 2,
                        borderColor: activeImage === index ? "primary.main" : "divider",
                        bgcolor: "background.paper",
                        overflow: "hidden",
                        p: 0,
                      }}
                    >
                      <Image src={image.url} alt="" fill unoptimized style={{ objectFit: "contain", padding: 4 }} />
                    </IconButton>
                  ))}
                </Stack>
              ) : null}
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Stack component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, delay: 0.05 }}>
            {product.category ? (
              <Chip label={product.category} size="small" color="primary" variant="outlined" sx={{ alignSelf: "flex-start", fontWeight: 600 }} />
            ) : null}

            <Typography variant="h4" fontWeight={700} sx={{ mt: 1.5, lineHeight: 1.3 }}>
              {title}
            </Typography>

            {product.ratings?.average_rating > 0 ? (
              <Stack direction="row" alignItems="center" flexWrap="wrap" spacing={1} sx={{ mt: 2 }}>
                <RatingStars rating={product.ratings.average_rating} />
                <Typography variant="body2" fontWeight={600}>
                  {product.ratings.average_rating}
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  ({product.ratings.total_reviews} reviews)
                </Typography>
              </Stack>
            ) : null}

            <Box sx={{ mt: 2 }}>
              <Stack direction="row" alignItems="flex-end" flexWrap="wrap" spacing={1.5}>
                <Typography variant="h4" fontWeight={700}>
                  ৳{salePrice.toLocaleString()}
                </Typography>
                {regularPrice > salePrice ? (
                  <Typography variant="h6" color="text.disabled" sx={{ textDecoration: "line-through", pb: 0.25 }}>
                    ৳{regularPrice.toLocaleString()}
                  </Typography>
                ) : null}
              </Stack>
              {!outOfStock && inCart && remainingStock === 0 ? (
                <Typography variant="caption" fontWeight={600} color="warning.main" sx={{ mt: 0.5, display: "block" }}>
                  Cannot add more — stock limit reached
                </Typography>
              ) : null}
            </Box>

            {variantConfig.required ? (
              <Box sx={{ mt: 2.5 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                  Select {variantConfig.label} <Typography component="span" color="error.main">*</Typography>
                </Typography>
                <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
                  {variantConfig.options.map((option) => {
                    const optionOutOfStock = isVariantOutOfStock(product, option);
                    const selected = selectedVariant === option;
                    return (
                      <Button
                        key={option}
                        variant={selected ? "contained" : "outlined"}
                        disabled={optionOutOfStock}
                        onClick={() => setSelectedVariant(option)}
                        size="small"
                        sx={{ fontWeight: 600, textTransform: "none" }}
                      >
                        {option}
                        {optionOutOfStock ? " (out of stock)" : ""}
                      </Button>
                    );
                  })}
                </Stack>
              </Box>
            ) : null}

            {!outOfStock ? (
              <Box sx={{ mt: 2.5 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                  Quantity
                </Typography>
                <Stack direction="row" alignItems="stretch" spacing={1.25}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    sx={{
                      flexShrink: 0,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                      bgcolor: "grey.50",
                      height: 48,
                    }}
                  >
                    <IconButton aria-label="Decrease quantity" onClick={() => setQuantity((q) => clampQty(q - 1))} size="small">
                      <RemoveRoundedIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="body1" fontWeight={700} sx={{ minWidth: 36, textAlign: "center" }}>
                      {quantity}
                    </Typography>
                    <IconButton aria-label="Increase quantity" onClick={increaseQuantity} size="small">
                      <AddRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>

                  <Button
                    fullWidth
                    variant={inCart ? "outlined" : "contained"}
                    onClick={handleAddToCart}
                    aria-label={inCart ? `In cart (${cartQty}) — remove` : "Add to cart"}
                    startIcon={inCart ? <CheckRoundedIcon /> : <AddShoppingCartRoundedIcon />}
                    sx={{
                      minHeight: 48,
                      flex: 1,
                      fontWeight: 700,
                      textTransform: "none",
                    }}
                  >
                    {inCart ? `In cart (${cartQty})` : "Add to cart"}
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Box sx={{ mt: 2.5 }}>
                <Button
                  fullWidth
                  variant={inCart ? "outlined" : "contained"}
                  onClick={handleAddToCart}
                  disabled={!inCart}
                  aria-label={inCart ? `In cart (${cartQty}) — remove` : "Add to cart"}
                  startIcon={inCart ? <CheckRoundedIcon /> : <AddShoppingCartRoundedIcon />}
                  sx={{ minHeight: 48, fontWeight: 700, textTransform: "none" }}
                >
                  {inCart ? `In cart (${cartQty})` : "Out of stock"}
                </Button>
              </Box>
            )}

            <Box
              component={motion.div}
              animate={{ scale: [1, 1.015, 1] }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ scale: { duration: 2.2, repeat: Infinity, ease: "easeInOut" } }}
              sx={{ mt: 1.25 }}
            >
              <Button
                fullWidth
                variant="contained"
                onClick={handleBuy}
                disabled={outOfStock && !inCart}
                startIcon={<LocalMallRoundedIcon />}
                sx={{
                  minHeight: 48,
                  fontWeight: 700,
                  textTransform: "none",
                  boxShadow: "0 4px 14px -4px rgba(79,70,229,0.55)",
                }}
              >
                {inCart ? "Go to checkout" : "Buy now"}
              </Button>
            </Box>

            <Grid container spacing={1.5} sx={{ mt: 2 }}>
              {trustFeatures.map(({ icon: Icon, label }) => (
                <Grid key={label} size={{ xs: 12, sm: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ border: 1, borderColor: "grey.100", borderRadius: 1, bgcolor: "background.paper", px: 1.5, py: 1.25 }}>
                    <Icon sx={{ fontSize: 18, color: "primary.main", flexShrink: 0 }} />
                    <Typography variant="caption" fontWeight={500} color="text.secondary">
                      {label}
                    </Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>

            {(variantConfig.required || product.attributes?.material) && (
              <Paper variant="outlined" sx={{ mt: 4, p: { xs: 2, sm: 2.5 } }}>
                <Typography variant="body2" fontWeight={700}>
                  Details
                </Typography>
                <Stack spacing={1} sx={{ mt: 1.5 }}>
                  {variantConfig.required ? (
                    <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ borderBottom: 1, borderColor: "grey.100", pb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {variantConfig.label}
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {variantConfig.options.join(", ")}
                      </Typography>
                    </Stack>
                  ) : null}
                  {product.attributes?.material ? (
                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                      <Typography variant="body2" color="text.secondary">
                        Material
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {product.attributes.material}
                      </Typography>
                    </Stack>
                  ) : null}
                </Stack>
              </Paper>
            )}

            {product.description ? (
              <Paper variant="outlined" sx={{ mt: 2, p: { xs: 2, sm: 2.5 } }}>
                <Typography variant="body2" fontWeight={700}>
                  Product description
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, whiteSpace: "pre-line", lineHeight: 1.7 }}>
                  {product.description}
                </Typography>
              </Paper>
            ) : null}
          </Stack>
        </Grid>
      </Grid>

      {product.category ? (
        <Box component="section" sx={{ mt: { xs: 7, sm: 8 }, pt: 5, borderTop: 1, borderColor: "divider" }}>
          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "flex-end" }} justifyContent="space-between" spacing={1} sx={{ mb: 3 }}>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="caption" fontWeight={600} color="primary.main">
                Same category
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
                {product.category} — more products
              </Typography>
            </Box>
            {product.category_slug ? (
              <Typography component={Link} href={`/products?category=${product.category_slug}`} variant="body2" fontWeight={600} color="primary.main" sx={{ flexShrink: 0, textDecoration: "none" }}>
                View all
              </Typography>
            ) : (
              <Typography component={Link} href="/products" variant="body2" fontWeight={600} color="primary.main" sx={{ textDecoration: "none" }}>
                All products
              </Typography>
            )}
          </Stack>

          {relatedProducts.length > 0 ? (
            <Box sx={productGridSx}>
              {relatedProducts.map((item, index) => (
                <StoreProductCard key={item._id} product={item} index={index} />
              ))}
            </Box>
          ) : (
            <Paper variant="outlined" sx={{ borderStyle: "dashed", px: 3, py: 5, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                No more products in this category.
              </Typography>
              <Typography component={Link} href="/products" variant="body2" fontWeight={600} color="primary.main" sx={{ mt: 1.5, display: "inline-block", textDecoration: "none" }}>
                View all products
              </Typography>
            </Paper>
          )}
        </Box>
      ) : null}
    </StoreContainer>
  );
}
