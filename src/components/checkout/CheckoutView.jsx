"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import { useStoreSettings } from "@/components/providers/SiteSettingsProvider";
import { useProducts } from "@/hooks/useProducts";
import { createOrder } from "@/lib/api/orders";
import { getMaxLineQuantity } from "@/lib/cart";
import { normalizePhone, validateCustomerDetails } from "@/lib/orderValidation";
import { getProductVariantConfig, getVariantTypeLabel } from "@/lib/productVariants";
import { getProductCardImageUrl } from "@/lib/imageUrl";
import { buildCartPixelPayload, trackMetaEvent } from "@/lib/metaPixel";
import { buildDeliveryOptions } from "@/lib/shipping";

function getItemVariantOptions(item, products) {
  if (item.variant_options?.length) return item.variant_options;

  const product = products.find((entry) => entry._id === item._id);
  if (!product) {
    return item.selected_variant ? [item.selected_variant] : [];
  }

  return getProductVariantConfig(product).options;
}

function CheckoutItemCard({ item, items, products, onUpdateQty, onUpdateVariant, onRemove }) {
  const variantOptions = getItemVariantOptions(item, products);
  const hasVariants = variantOptions.length > 0;
  const variantLabel = item.variant_label || getVariantTypeLabel({ variant_type: item.variant_type }, "bn");
  const discount =
    item.regular_price > item.price
      ? Math.round(((item.regular_price - item.price) / item.regular_price) * 100)
      : 0;
  const lineTotal = item.price * item.quantity;
  const imageSrc = getProductCardImageUrl(item.image);
  const maxQty = getMaxLineQuantity(item, items);

  return (
    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      <Stack direction="row" spacing={{ xs: 1.75, sm: 2 }} sx={{ p: { xs: 1.75, sm: 2 } }}>
        <Box
          sx={{
            position: "relative",
            width: { xs: 76, sm: 80 },
            height: { xs: 76, sm: 80 },
            flexShrink: 0,
            overflow: "hidden",
            borderRadius: 1,
            border: 1,
            borderColor: "grey.100",
            bgcolor: "grey.50",
          }}
        >
          {imageSrc ? (
            <Image src={imageSrc} alt={item.title} fill unoptimized style={{ objectFit: "cover", objectPosition: "center" }} />
          ) : (
            <Stack alignItems="center" justifyContent="center" sx={{ height: 1, color: "grey.300" }}>
              <Inventory2OutlinedIcon />
            </Stack>
          )}
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700} sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {item.title}
              </Typography>
              <Stack direction="row" alignItems="center" flexWrap="wrap" spacing={1} sx={{ mt: 0.75 }}>
                <Typography variant="body1" fontWeight={700}>
                  ৳{item.price.toLocaleString()}
                </Typography>
                {item.regular_price > item.price ? (
                  <>
                    <Typography variant="caption" color="text.disabled" sx={{ textDecoration: "line-through" }}>
                      ৳{item.regular_price.toLocaleString()}
                    </Typography>
                    {discount > 0 ? (
                      <Chip label={`-${discount}%`} size="small" color="error" sx={{ height: 18, fontSize: 10, fontWeight: 700 }} />
                    ) : null}
                  </>
                ) : null}
              </Stack>
            </Box>
            <IconButton size="small" aria-label="Remove item" onClick={() => onRemove(item)} color="error">
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Stack direction="row" flexWrap="wrap" alignItems="flex-end" spacing={1.5} sx={{ mt: 1.5 }}>
            {hasVariants ? (
              <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
                <InputLabel id={`variant-${item._id}`}>{variantLabel}</InputLabel>
                <Select
                  labelId={`variant-${item._id}`}
                  label={variantLabel}
                  value={item.selected_variant || variantOptions[0] || ""}
                  onChange={(event) => onUpdateVariant(item, event.target.value)}
                >
                  {variantOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : null}

            <Box>
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: "block", mb: 0.5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Quantity
              </Typography>
              <Stack direction="row" alignItems="center" sx={{ border: 1, borderColor: "divider", borderRadius: 1, bgcolor: "grey.50", height: 36 }}>
                <IconButton size="small" aria-label="Decrease quantity" onClick={() => onUpdateQty(item, item.quantity - 1)}>
                  <RemoveRoundedIcon fontSize="small" />
                </IconButton>
                <Typography variant="body2" fontWeight={700} sx={{ minWidth: 32, textAlign: "center", borderInline: 1, borderColor: "divider", bgcolor: "background.paper", px: 1, py: 0.5 }}>
                  {item.quantity}
                </Typography>
                <IconButton
                  size="small"
                  aria-label="Increase quantity"
                  onClick={() => onUpdateQty(item, item.quantity + 1)}
                  disabled={item.quantity >= maxQty}
                >
                  <AddRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ borderTop: 1, borderColor: "grey.100", bgcolor: "primary.50", px: { xs: 1.75, sm: 2 }, py: 1.25 }}>
        <Typography variant="caption" color="text.secondary">
          {item.quantity} × ৳{item.price.toLocaleString()}
        </Typography>
        <Typography variant="body2" fontWeight={700} color="primary.dark">
          Total ৳{lineTotal.toLocaleString()}
        </Typography>
      </Stack>
    </Paper>
  );
}

export default function CheckoutView() {
  const router = useRouter();
  const { items, updateQuantity, updateVariant, removeFromCart, clearCart } = useCart();
  const { data: products = [] } = useProducts();
  const settings = useStoreSettings();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [delivery, setDelivery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const totalDiscount = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Math.max(0, (item.regular_price - item.price) * item.quantity),
        0
      ),
    [items]
  );

  const deliveryOptions = useMemo(() => buildDeliveryOptions(items, settings), [items, settings]);

  useEffect(() => {
    if (!deliveryOptions.length) return;
    if (!delivery || !deliveryOptions.some((option) => option.id === delivery)) {
      setDelivery(deliveryOptions[0].id);
    }
  }, [delivery, deliveryOptions]);

  const deliveryCharge = deliveryOptions.find((option) => option.id === delivery)?.charge ?? 0;
  const isFreeDelivery = deliveryOptions.some((option) => option.isFree);
  const payable = subtotal + deliveryCharge;
  const initiateCheckoutTracked = useRef(false);

  useEffect(() => {
    if (!items.length || initiateCheckoutTracked.current) return;
    initiateCheckoutTracked.current = true;
    trackMetaEvent("InitiateCheckout", buildCartPixelPayload(items, payable));
  }, [items, payable]);

  function clearFieldError(field) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleUpdateQty(item, quantity) {
    if (quantity > getMaxLineQuantity(item, items)) {
      toast.error(`You can keep up to ${getMaxLineQuantity(item, items)}`);
      return;
    }
    updateQuantity(item._id, quantity, item.title, item.selected_variant);
  }

  function handleUpdateVariant(item, newVariant) {
    const product = products.find((entry) => entry._id === item._id);
    updateVariant(item._id, item.selected_variant, newVariant, item.title, product);
  }

  function handleRemove(item) {
    removeFromCart(item._id, item.title, item.selected_variant);
  }

  async function handleConfirm(event) {
    event.preventDefault();

    const validation = validateCustomerDetails({ name, phone, address });
    if (!validation.ok) {
      setFieldErrors(validation.errors);
      toast.error(Object.values(validation.errors)[0]);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      const order = await createOrder({
        name: validation.values.name,
        phone: validation.values.phone,
        address: validation.values.address,
        delivery,
        items: items.map((item) => ({
          _id: item._id,
          title: item.title,
          quantity: item.quantity,
          selected_variant: item.selected_variant || "",
        })),
      });

      clearCart();
      sessionStorage.setItem(
        "nexa_last_order",
        JSON.stringify({
          order_number: order.order_number,
          phone: validation.values.phone,
          total: order.pricing?.total,
          currency: order.pricing?.currency || "BDT",
          items: (order.items || []).map((item) => ({
            id: item.product_id || item.slug,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
          })),
        })
      );

      router.push("/thankyou");
      clearCart();
      toast.success("Order placed successfully!");
    } catch (error) {
      toast.error(error.message || "Could not place order");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <Paper variant="outlined" sx={{ mx: "auto", maxWidth: 480, p: { xs: 3, sm: 5 }, textAlign: "center" }}>
        <ShoppingBagOutlinedIcon sx={{ mx: "auto", fontSize: 40, color: "grey.300" }} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Your cart is empty.
        </Typography>
        <Button component={Link} href="/products" sx={{ mt: 2 }}>
          Browse products
        </Button>
      </Paper>
    );
  }

  return (
    <Box sx={{ mx: "auto", maxWidth: 1152, minWidth: 0 }}>
      <Stack sx={{ mx: "auto", maxWidth: 720, alignItems: "center", textAlign: "center" }}>
        <Typography variant="h4" fontWeight={700}>
          Confirm your order
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Enter your name, address, and phone number
        </Typography>
      </Stack>

      <Grid container spacing={{ xs: 4, lg: 5 }} sx={{ mt: 4 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper
            component="form"
            onSubmit={handleConfirm}
            variant="outlined"
            sx={{
              p: { xs: 2, sm: 2.5 },
              border: { lg: 0 },
              boxShadow: { lg: 0 },
              bgcolor: { lg: "transparent" },
            }}
          >
            <Stack spacing={2.5}>
              <TextField
                id="checkout-name"
                label="Your name"
                placeholder="Enter your full name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  clearFieldError("name");
                }}
                error={Boolean(fieldErrors.name)}
                helperText={fieldErrors.name}
                fullWidth
              />

              <TextField
                id="checkout-phone"
                label="Phone number"
                placeholder="01XXXXXXXXX"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(event) => {
                  setPhone(normalizePhone(event.target.value));
                  clearFieldError("phone");
                }}
                error={Boolean(fieldErrors.phone)}
                helperText={fieldErrors.phone}
                fullWidth
              />

              <TextField
                id="checkout-address"
                label="Your address"
                placeholder="House/road, area, district — full address"
                value={address}
                onChange={(event) => {
                  setAddress(event.target.value);
                  clearFieldError("address");
                }}
                error={Boolean(fieldErrors.address)}
                helperText={fieldErrors.address}
                multiline
                minRows={4}
                fullWidth
              />

              <Box sx={{ pt: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                  Delivery charge
                </Typography>
                <RadioGroup value={delivery} onChange={(event) => setDelivery(event.target.value)}>
                  {deliveryOptions.map((option) => (
                    <Paper
                      key={option.id}
                      variant="outlined"
                      sx={{
                        mb: 1,
                        px: 1.5,
                        py: 0.5,
                        borderColor: delivery === option.id ? "primary.main" : "divider",
                        bgcolor: delivery === option.id ? "primary.50" : "grey.50",
                      }}
                    >
                      <FormControlLabel
                        value={option.id}
                        control={<Radio size="small" />}
                        label={option.isFree ? option.label : `${option.label} — ৳${option.charge}`}
                      />
                    </Paper>
                  ))}
                </RadioGroup>
              </Box>

              <Box sx={{ pt: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                  Payment method
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 2,
                    py: 1.75,
                    borderWidth: 2,
                    borderColor: "primary.light",
                    bgcolor: "primary.50",
                    opacity: 0.95,
                  }}
                >
                  <Radio checked disabled size="small" />
                  <PaymentsOutlinedIcon color="primary" />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={700}>
                      Cash On Delivery
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Pay when you receive your products
                    </Typography>
                  </Box>
                  <LockOutlinedIcon fontSize="small" color="disabled" titleAccess="Only payment option" />
                </Paper>
              </Box>

              <Button
                type="submit"
                variant="contained"
                color="error"
                size="large"
                disabled={submitting}
                fullWidth
                className="animate-checkout-confirm-shake"
                sx={{ display: { lg: "none" }, py: 1.75, fontWeight: 800 }}
              >
                {submitting ? "Processing..." : "Confirm order"}
              </Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Box sx={{ position: { lg: "sticky" }, top: { lg: 96 } }}>
            <Typography variant="h6" fontWeight={700}>
              Your order
            </Typography>

            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {items.map((item) => (
                <CheckoutItemCard
                  key={`${item._id}-${item.selected_variant || "default"}`}
                  item={item}
                  items={items}
                  products={products}
                  onUpdateQty={handleUpdateQty}
                  onUpdateVariant={handleUpdateVariant}
                  onRemove={handleRemove}
                />
              ))}
            </Stack>

            <Paper variant="outlined" sx={{ mt: 2.5, p: 2 }}>
              <Stack spacing={1} divider={<Divider />}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Subtotal
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    ৳{subtotal.toLocaleString()}
                  </Typography>
                </Stack>
                {totalDiscount > 0 ? (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="success.main">
                      You're saving
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="success.main">
                      -৳{totalDiscount.toLocaleString()}
                    </Typography>
                  </Stack>
                ) : null}
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Delivery charge
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color={isFreeDelivery ? "success.main" : "text.primary"}>
                    {isFreeDelivery ? "Free delivery" : `৳${deliveryCharge.toLocaleString()}`}
                  </Typography>
                </Stack>
              </Stack>
              <Stack direction="row" justifyContent="space-between" sx={{ pt: 1.5 }}>
                <Typography fontWeight={700}>Amount to pay</Typography>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  ৳{payable.toLocaleString()}
                </Typography>
              </Stack>
            </Paper>

            <Button
              type="button"
              variant="contained"
              size="large"
              disabled={submitting}
              onClick={handleConfirm}
              fullWidth
              sx={{ mt: 2, display: { xs: "none", lg: "inline-flex" }, py: 1.5, fontWeight: 700 }}
            >
              {submitting ? "Processing..." : "Confirm order"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
