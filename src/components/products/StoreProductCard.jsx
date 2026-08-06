"use client";

import Image from "next/image";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { resolveProductVariant } from "@/lib/productVariants";
import { isProductFullyOutOfStock } from "@/lib/variantStock";
import { getProductCardImageUrl } from "@/lib/imageUrl";

export default function StoreProductCard({ product, index = 0 }) {
  const { toggleCart, items } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const defaultVariant = resolveProductVariant(product);
  const image = getProductCardImageUrl(product.images?.[0]?.url);
  const discount = product.pricing?.discount_percentage || 0;
  const title = product.title_bn || product.title_en;
  const salePrice = product.pricing?.sale_price;
  const regularPrice = product.pricing?.regular_price;
  const outOfStock = isProductFullyOutOfStock(product);
  const inCart = items.some(
    (item) =>
      item._id === product._id &&
      (item.selected_variant || "") === (defaultVariant || "")
  );
  const wishlisted = isInWishlist(product._id, defaultVariant);

  function handleCartToggle(event) {
    event.preventDefault();
    event.stopPropagation();
    if (outOfStock) {
      toast.error("This product is out of stock");
      return;
    }
    toggleCart(product);
  }

  function handleWishlistToggle(event) {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist(product, defaultVariant);
  }

  return (
    <Box
      component={motion.article}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{
        delay: Math.min(index * 0.04, 0.24),
        duration: 0.42,
        ease: [0.22, 1, 0.36, 1],
      }}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: 1,
        minWidth: 0,
        bgcolor: "transparent",
        "&:hover .product-media": {
          boxShadow: "0 18px 40px -24px rgba(15,23,42,0.35)",
        },
        "&:hover .product-image": {
          transform: "scale(1.04)",
        },
        "&:hover .product-title": {
          color: "primary.main",
        },
        "&:hover .product-actions": {
          opacity: 1,
          transform: "translateY(0)",
        },
      }}
    >
      <Box
        className="product-media"
        sx={{
          position: "relative",
          aspectRatio: "4 / 5",
          width: 1,
          overflow: "hidden",
          borderRadius: 1.5,
          bgcolor: "#f3f0ee",
          transition: "box-shadow 0.35s ease",
        }}
      >
        <Box
          component={Link}
          href={`/products/${product.slug}`}
          aria-label={title}
          sx={{ position: "absolute", inset: 0, displayDecoration: "none" }}
        >
          {image ? (
            <Image
              className="product-image"
              src={image}
              alt={title}
              fill
              unoptimized
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              style={{
                objectFit: "cover",
                objectPosition: "center",
                transition: "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          ) : (
            <Stack
              sx={{
                height: 1,
                color: "grey.400",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Inventory2OutlinedIcon sx={{ fontSize: 36 }} />
            </Stack>
          )}
        </Box>

        {discount > 0 ? (
          <Box
            sx={{
              position: "absolute",
              top: { xs: 6, sm: 10 },
              left: { xs: 6, sm: 10 },
              zIndex: 2,
              px: { xs: 0.75, sm: 1 },
              py: 0.25,
              borderRadius: 0.75,
              bgcolor: "error.main",
              color: "common.white",
              typography: "caption",
              fontWeight: 700,
              fontSize: { xs: 9, sm: 11 },
              letterSpacing: "0.02em",
            }}
          >
            -{discount}%
          </Box>
        ) : null}

        {outOfStock ? (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(1px)",
              pointerEvents: "none",
            }}
          >
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{
                px: { xs: 1, sm: 1.25 },
                py: 0.5,
                borderRadius: 0.75,
                bgcolor: "rgba(15,23,42,0.88)",
                color: "common.white",
                fontSize: { xs: 10, sm: 12 },
                letterSpacing: "0.04em",
              }}
            >
              Out of stock
            </Typography>
          </Box>
        ) : null}

        <IconButton
          component={motion.button}
          whileTap={{ scale: 0.9 }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={handleWishlistToggle}
          size="small"
          sx={{
            position: "absolute",
            top: { xs: 6, sm: 8 },
            right: { xs: 6, sm: 8 },
            zIndex: 2,
            width: { xs: 26, sm: 34 },
            height: { xs: 26, sm: 34 },
            bgcolor: "rgba(255,255,255,0.92)",
            color: wishlisted ? "error.main" : "text.secondary",
            boxShadow: "0 2px 10px rgba(15,23,42,0.1)",
            "&:hover": {
              bgcolor: "common.white",
              color: "error.main",
            },
          }}
        >
          {wishlisted ? (
            <FavoriteRoundedIcon sx={{ fontSize: { xs: 14, sm: 18 } }} />
          ) : (
            <FavoriteBorderRoundedIcon sx={{ fontSize: { xs: 14, sm: 18 } }} />
          )}
        </IconButton>

        <Stack
          className="product-actions"
          direction="row"
          spacing={{ xs: 0.5, sm: 0.75 }}
          sx={{
            position: "absolute",
            left: { xs: 6, sm: 10 },
            right: { xs: 6, sm: 10 },
            bottom: { xs: 6, sm: 10 },
            zIndex: 2,
            opacity: { xs: 1, md: 0 },
            transform: { xs: "none", md: "translateY(6px)" },
            transition: "opacity 0.28s ease, transform 0.28s ease",
          }}
        >
          <IconButton
            component={motion.button}
            whileTap={{ scale: 0.92 }}
            onClick={handleCartToggle}
            disabled={outOfStock}
            aria-label={inCart ? "Remove from cart" : "Add to cart"}
            sx={{
              width: { xs: 28, sm: 40 },
              height: { xs: 28, sm: 40 },
              flexShrink: 0,
              borderRadius: 1,
              bgcolor: inCart ? "primary.main" : "rgba(255,255,255,0.96)",
              color: inCart ? "primary.contrastText" : "text.primary",
              boxShadow: "0 4px 14px rgba(15,23,42,0.12)",
              "&:hover": {
                bgcolor: inCart ? "primary.dark" : "common.white",
              },
              "&.Mui-disabled": {
                bgcolor: "rgba(255,255,255,0.7)",
                color: "text.disabled",
              },
            }}
          >
            {inCart ? (
              <CheckRoundedIcon sx={{ fontSize: { xs: 14, sm: 18 } }} />
            ) : (
              <LocalMallOutlinedIcon sx={{ fontSize: { xs: 14, sm: 18 } }} />
            )}
          </IconButton>
          <Button
            component={Link}
            href={`/products/${product.slug}`}
            variant="contained"
            fullWidth
            sx={{
              height: { xs: 28, sm: 40 },
              minWidth: 0,
              px: { xs: 1, sm: 2 },
              fontSize: { xs: 10, sm: 13 },
              fontWeight: 700,
              lineHeight: 1.1,
              bgcolor: "rgba(15,23,42,0.92)",
              color: "common.white",
              boxShadow: "0 4px 14px rgba(15,23,42,0.18)",
              "&:hover": {
                bgcolor: "secondary.main",
              },
            }}
          >
            Order now
          </Button>
        </Stack>
      </Box>

      <Box
        component={Link}
        href={`/products/${product.slug}`}
        sx={{
          display: "block",
          pt: 1.5,
          px: 0.25,
          textDecoration: "none",
          color: "inherit",
          flex: 1,
        }}
      >
        <Typography
          className="product-title"
          variant="body2"
          fontWeight={600}
          color="text.primary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: { xs: 36, sm: 40 },
            lineHeight: 1.35,
            letterSpacing: "-0.01em",
            transition: "color 0.2s ease",
          }}
        >
          {title}
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          sx={{ mt: 0.75, alignItems: "baseline" }}
        >
          <Typography
            variant="subtitle1"
            fontWeight={700}
            color="text.primary"
            sx={{ letterSpacing: "-0.02em", lineHeight: 1.2 }}
          >
            ৳{salePrice?.toLocaleString()}
          </Typography>
          {regularPrice > salePrice ? (
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ textDecoration: "line-through" }}
            >
              ৳{regularPrice.toLocaleString()}
            </Typography>
          ) : null}
        </Stack>
      </Box>
    </Box>
  );
}
