"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { useCart } from "@/hooks/useCart";
import { getMaxLineQuantity } from "@/lib/cart";
import { getVariantTypeLabel } from "@/lib/productVariants";
import { getProductCardImageUrl } from "@/lib/imageUrl";

const drawerPaperSx = {
  width: { xs: "100%", sm: 380 },
  maxWidth: "100%",
  height: "100%",
  maxHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

export default function CartSidebar({ open, onClose }) {
  const router = useRouter();
  const { items, count, updateQuantity, removeFromCart } = useCart();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function handleCheckout() {
    onClose();
    router.push("/checkout");
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      slotProps={{
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
            Your cart
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {count} items
          </Typography>
        </Box>
        <IconButton aria-label="Close cart" onClick={onClose} size="small">
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
          <ShoppingBagOutlinedIcon sx={{ fontSize: 48, color: "grey.300", display: "block" }} />
          <Typography variant="body2" fontWeight={600}>
            Your cart is empty
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Tap Add to cart on a product to get started
          </Typography>
          <Button component={Link} href="/products" onClick={onClose} variant="contained" sx={{ mt: 1 }}>
            Browse products
          </Button>
        </Stack>
      ) : (
        <>
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
              const lineTotal = item.price * item.quantity;
              const variantLabel =
                item.variant_label ||
                getVariantTypeLabel({ variant_type: item.variant_type }, "bn");
              const imageSrc = getProductCardImageUrl(item.image);

              return (
                <Box
                  key={`${item._id}-${item.selected_variant || "default"}`}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    p: { xs: 1.25, sm: 1.5 },
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
                            <Typography
                              component="span"
                              variant="caption"
                              sx={{
                                mt: 0.5,
                                display: "inline-block",
                                maxWidth: 1,
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                bgcolor: "primary.light",
                                color: "primary.dark",
                                fontWeight: 600,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {variantLabel}: {item.selected_variant}
                            </Typography>
                          ) : null}
                          <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5 }}>
                            ৳{item.price.toLocaleString()}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          aria-label="Remove from cart"
                          onClick={() =>
                            removeFromCart(item._id, item.title, item.selected_variant)
                          }
                          sx={{ alignSelf: "flex-start", flexShrink: 0 }}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Stack>

                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ mt: 1.5, justifyContent: "space-between", flexWrap: "wrap", rowGap: 1 }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          sx={{
                            border: 1,
                            borderColor: "divider",
                            borderRadius: 1,
                            overflow: "hidden",
                            height: 32,
                            flexShrink: 0,
                          }}
                        >
                          <IconButton
                            size="small"
                            aria-label="Decrease quantity"
                            onClick={() =>
                              updateQuantity(
                                item._id,
                                item.quantity - 1,
                                item.title,
                                item.selected_variant
                              )
                            }
                          >
                            <RemoveRoundedIcon fontSize="inherit" />
                          </IconButton>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            sx={{
                              minWidth: 28,
                              textAlign: "center",
                              borderLeft: 1,
                              borderRight: 1,
                              borderColor: "divider",
                              px: 0.5,
                            }}
                          >
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            aria-label="Increase quantity"
                            disabled={item.quantity >= getMaxLineQuantity(item, items)}
                            onClick={() =>
                              updateQuantity(
                                item._id,
                                item.quantity + 1,
                                item.title,
                                item.selected_variant
                              )
                            }
                          >
                            <AddRoundedIcon fontSize="inherit" />
                          </IconButton>
                        </Stack>
                        <Typography variant="caption" fontWeight={700} color="primary">
                          ৳{lineTotal.toLocaleString()}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Stack>

          <Divider />
          <Box
            sx={{
              flexShrink: 0,
              p: { xs: 1.5, sm: 2 },
              pb: "max(1rem, env(safe-area-inset-bottom))",
              bgcolor: "background.paper",
            }}
          >
            <Stack direction="row" sx={{ mb: 2, justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                Total
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                ৳{total.toLocaleString()}
              </Typography>
            </Stack>
            <Button fullWidth variant="contained" size="large" onClick={handleCheckout}>
              Checkout
            </Button>
          </Box>
        </>
      )}
    </Drawer>
  );
}
