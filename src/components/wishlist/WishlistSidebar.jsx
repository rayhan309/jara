"use client";

import Image from "next/image";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { getProductCardImageUrl } from "@/lib/imageUrl";
import { removeFromWishlist as removeWishlistItem } from "@/lib/wishlist";

const drawerPaperSx = {
  width: { xs: "min(300px, 78vw)", sm: 340 },
  maxWidth: "78vw",
  height: "100%",
  maxHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const drawerBackdropSx = {
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  backgroundColor: "rgba(15, 23, 42, 0.28)",
};

export default function WishlistSidebar({ open, onClose }) {
  const { items, count, removeFromWishlist, syncWishlist } = useWishlist();
  const { addToCart } = useCart();

  function handleAddToCart(item) {
    const added = addToCart(
      {
        _id: item._id,
        slug: item.slug,
        title: item.title,
        title_en: item.title_en,
        title_bn: item.title,
        images: item.image ? [{ url: item.image }] : [],
        pricing: {
          sale_price: item.price,
          regular_price: item.regular_price,
        },
        price: item.price,
      },
      1,
      item.selected_variant || ""
    );

    if (added) {
      removeWishlistItem(item._id, item.selected_variant || "");
      syncWishlist();
    }
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      slotProps={{
        backdrop: { sx: drawerBackdropSx },
        paper: { sx: drawerPaperSx },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 2,
          borderBottom: 1,
          borderColor: "divider",
          flexShrink: 0,
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            Wishlist
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {count} items
          </Typography>
        </Box>
        <IconButton aria-label="Close wishlist" onClick={onClose} size="small">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>

      {items.length === 0 ? (
        <Stack
          spacing={1.5}
          sx={{
            flex: 1,
            minHeight: 0,
            px: 3,
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <FavoriteBorderRoundedIcon sx={{ fontSize: 48, color: "grey.300", display: "block" }} />
          <Typography variant="body2" fontWeight={600} color="text.primary">
            Your wishlist is empty
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Tap the heart icon on products you love
          </Typography>
          <Button component={Link} href="/products" onClick={onClose} variant="contained" sx={{ mt: 1 }}>
            Browse products
          </Button>
        </Stack>
      ) : (
        <Stack
          spacing={1.5}
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            p: { xs: 1.5, sm: 2 },
            WebkitOverflowScrolling: "touch",
          }}
        >
          {items.map((item) => {
            const imageSrc = getProductCardImageUrl(item.image);

            return (
              <Box
                key={`${item._id}-${item.selected_variant || "default"}`}
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  p: { xs: 1.25, sm: 1.5 },
                  bgcolor: "background.paper",
                }}
              >
                <Stack direction="row" spacing={{ xs: 1.25, sm: 1.5 }}>
                  <Box
                    sx={{
                      position: "relative",
                      width: { xs: 56, sm: 64 },
                      height: { xs: 56, sm: 64 },
                      flexShrink: 0,
                      borderRadius: 1,
                      overflow: "hidden",
                      bgcolor: "grey.50",
                      border: 1,
                      borderColor: "divider",
                    }}
                  >
                    {imageSrc ? (
                      <Image src={imageSrc} alt={item.title} fill unoptimized style={{ objectFit: "cover" }} />
                    ) : (
                      <Stack
                        alignItems="center"
                        sx={{ height: 1, color: "grey.300", justifyContent: "center" }}
                      >
                        <Inventory2OutlinedIcon fontSize="small" />
                      </Stack>
                    )}
                  </Box>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between" }}>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            wordBreak: "break-word",
                          }}
                        >
                          {item.title}
                        </Typography>
                        {item.selected_variant ? (
                          <Typography variant="caption" color="primary" fontWeight={600}>
                            {item.selected_variant}
                          </Typography>
                        ) : null}
                        <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5 }}>
                          ৳{Number(item.price || 0).toLocaleString()}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        aria-label="Remove from wishlist"
                        onClick={() =>
                          removeFromWishlist(item._id, item.title, item.selected_variant)
                        }
                        sx={{
                          alignSelf: "flex-start",
                          flexShrink: 0,
                          color: "text.secondary",
                          "&:hover": { color: "error.main", bgcolor: "error.50" },
                        }}
                      >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      sx={{ mt: 1.5 }}
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        component={Link}
                        href={item.slug ? `/products/${item.slug}` : `/products/${item._id}`}
                        onClick={onClose}
                        fullWidth
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<ShoppingCartOutlinedIcon />}
                        onClick={() => handleAddToCart(item)}
                        fullWidth
                      >
                        Cart
                      </Button>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}

      {items.length > 0 ? (
        <>
          <Divider />
          <Box
            sx={{
              flexShrink: 0,
              p: { xs: 1.5, sm: 2 },
              pb: "max(1rem, env(safe-area-inset-bottom))",
              bgcolor: "background.paper",
            }}
          >
            <Button fullWidth variant="contained" component={Link} href="/products" onClick={onClose}>
              Browse more products
            </Button>
          </Box>
        </>
      ) : null}
    </Drawer>
  );
}
