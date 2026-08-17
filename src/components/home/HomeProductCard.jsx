"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { getProductVariantConfig, resolveProductVariant } from "@/lib/productVariants";
import { isProductFullyOutOfStock } from "@/lib/variantStock";

export default function HomeProductCard({ product, index = 0 }) {
  const router = useRouter();
  const { buyNow } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const variantConfig = getProductVariantConfig(product);
  const defaultVariant = resolveProductVariant(product);
  const image = product.images?.[0]?.url;
  const title = product.title_bn || product.title_en;
  const salePrice = product.pricing?.sale_price;
  const outOfStock = isProductFullyOutOfStock(product);
  const wishlisted = isInWishlist(product._id, defaultVariant);

  function handleOrder(event) {
    event.preventDefault();
    event.stopPropagation();

    if (outOfStock) {
      toast.error("এই পণ্যটি স্টকে নেই");
      return;
    }

    if (variantConfig.required) {
      router.push(`/products/${product.slug}`);
      return;
    }

    buyNow(product);
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
        "&:hover .home-media": {
          boxShadow: "0 18px 40px -24px rgba(15,23,42,0.35)",
        },
        "&:hover .home-image": {
          transform: "scale(1.04)",
        },
      }}
    >
      <Box
        className="home-media"
        sx={{
          position: "relative",
          width: 1,
          aspectRatio: "4 / 5",
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
          sx={{ position: "absolute", inset: 0 }}
        >
          {image ? (
            <Image
              className="home-image"
              src={image}
              alt={title}
              fill
              unoptimized
              style={{
                objectFit: "cover",
                objectPosition: "center",
                transition: "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          ) : (
            <Stack sx={{ height: 1, color: "grey.400", alignItems: "center", justifyContent: "center" }}>
              <Inventory2OutlinedIcon sx={{ fontSize: 36 }} />
            </Stack>
          )}
        </Box>

        <IconButton
          component={motion.button}
          whileTap={{ scale: 0.9 }}
          aria-label={wishlisted ? "উইশলিস্ট থেকে সরান" : "উইশলিস্টে যোগ করুন"}
          onClick={handleWishlistToggle}
          size="small"
          sx={{
            position: "absolute",
            top: { xs: 6, sm: 8 },
            right: { xs: 6, sm: 8 },
            width: { xs: 26, sm: 34 },
            height: { xs: 26, sm: 34 },
            bgcolor: "rgba(255,255,255,0.92)",
            color: wishlisted ? "error.main" : "text.secondary",
            boxShadow: "0 2px 10px rgba(15,23,42,0.1)",
            "&:hover": { bgcolor: "common.white", color: "error.main" },
          }}
        >
          {wishlisted ? (
            <FavoriteRoundedIcon sx={{ fontSize: { xs: 14, sm: 18 } }} />
          ) : (
            <FavoriteBorderRoundedIcon sx={{ fontSize: { xs: 14, sm: 18 } }} />
          )}
        </IconButton>

        <Box sx={{ position: "absolute", left: { xs: 6, sm: 10 }, right: { xs: 6, sm: 10 }, bottom: { xs: 6, sm: 10 } }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleOrder}
            disabled={outOfStock}
            sx={{
              height: { xs: 28, sm: 40 },
              minWidth: 0,
              px: { xs: 1, sm: 2 },
              fontSize: { xs: 10, sm: 13 },
              fontWeight: 700,
              lineHeight: 1.1,
              bgcolor: outOfStock ? "grey.400" : "rgba(15,23,42,0.92)",
              color: "common.white",
              boxShadow: "0 4px 14px rgba(15,23,42,0.18)",
              "&:hover": { bgcolor: "secondary.main" },
            }}
          >
            {outOfStock ? "স্টক নেই" : "অর্ডার করুন"}
          </Button>
        </Box>
      </Box>

      <Box
        component={Link}
        href={`/products/${product.slug}`}
        sx={{ display: "block", pt: 1.5, px: 0.25, textDecoration: "none", color: "inherit" }}
      >
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 36,
            lineHeight: 1.35,
            textAlign: "center",
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{ mt: 0.75, letterSpacing: "-0.02em", textAlign: "center" }}
        >
          ৳{salePrice?.toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
}

export function HomeProductCardSkeleton() {
  return (
    <Box>
      <Skeleton variant="rounded" sx={{ aspectRatio: "4 / 5", width: 1, borderRadius: 1.5 }} />
      <Stack spacing={1} sx={{ pt: 1.5, alignItems: "center" }}>
        <Skeleton width="80%" height={14} />
        <Skeleton width="35%" height={18} />
      </Stack>
    </Box>
  );
}
