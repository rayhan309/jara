"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { FieldError } from "@/components/dashboard/DashboardFormUi";
import { useUpdateAdminOrder } from "@/hooks/useAdminOrders";
import { useProductPicker } from "@/hooks/useDashboard";
import { useDebouncedValue } from "@/hooks/useDebounce";
import {
  calculateAdminOrderPricing,
  formatVariantDisplay,
  getOrderItemKey,
  normalizeAdminOrderItem,
} from "@/lib/adminOrderHelpers";
import { DEFAULT_ORDER_STATUS, formatDisplayOrderNumber, ORDER_STATUSES } from "@/lib/orderHelpers";
import { getDefaultProductVariant, getProductVariantConfig } from "@/lib/productVariants";
import { resolveProductPricing } from "@/lib/productPricing";
import { buildDeliveryOptions } from "@/lib/shipping";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import {
  DesktopTable,
  MobileCardList,
} from "@/components/shared/ResponsiveTable";

function mapOrderItemToDraft(item) {
  return normalizeAdminOrderItem({
    ...item,
    discount: item.discount ?? 0,
  });
}

function buildProductLine(product) {
  const variantConfig = getProductVariantConfig(product);
  const selectedVariant = getDefaultProductVariant(product);
  const pricing = resolveProductPricing(product, selectedVariant);

  return normalizeAdminOrderItem({
    product_id: product._id,
    slug: product.slug,
    title: product.title_bn || product.title_en,
    title_en: product.title_en,
    image: product.images?.[0]?.url || "",
    price: pricing.sale_price ?? 0,
    regular_price: pricing.regular_price ?? pricing.sale_price ?? 0,
    quantity: 1,
    discount: 0,
    selected_variant: selectedVariant,
    variant_type: variantConfig.type || "",
  });
}

function ProductThumb({ item }) {
  return (
    <Box
      sx={{
        position: "relative",
        width: 48,
        height: 48,
        borderRadius: 1,
        bgcolor: "grey.100",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {item.image ? (
        <Image src={item.image} alt={item.title} fill unoptimized className="object-contain p-1" />
      ) : (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 1, color: "text.disabled" }}>
          <ShoppingBagOutlinedIcon fontSize="small" sx={{ opacity: 0.4 }} />
        </Box>
      )}
    </Box>
  );
}

export default function OrderEditModal({ open, onClose, order }) {
  const { mutate: updateOrder, isPending } = useUpdateAdminOrder();
  const [productSearch, setProductSearch] = useState("");
  const debouncedProductSearch = useDebouncedValue(productSearch, 300);
  const { data: pickerProducts = [] } = useProductPicker(debouncedProductSearch, {
    enabled: open,
  });

  const [status, setStatus] = useState(DEFAULT_ORDER_STATUS);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryArea, setDeliveryArea] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("outside_dhaka");
  const [shippingFee, setShippingFee] = useState(0);
  const [orderDiscount, setOrderDiscount] = useState(0);
  const [items, setItems] = useState([]);
  const [addProductId, setAddProductId] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const { data: siteSettings } = useSiteSettings();
  const deliveryOptions = useMemo(
    () => buildDeliveryOptions(items, siteSettings),
    [items, siteSettings]
  );

  useEffect(() => {
    if (!open || !order) return;

    setStatus(order.status || DEFAULT_ORDER_STATUS);
    setName(order.customer?.name || "");
    setPhone(order.customer?.phone || "");
    setAddress(order.customer?.address || "");
    setDeliveryArea(order.customer?.delivery_area || order.delivery?.area || "");
    setDeliveryMethod(order.delivery?.method || "outside_dhaka");
    setShippingFee(order.pricing?.delivery_charge ?? order.delivery?.charge ?? 0);
    setOrderDiscount(order.pricing?.discount ?? 0);
    setItems((order.items || []).map(mapOrderItemToDraft));
    setAddProductId("");
    setProductSearch("");
    setSubmitError("");
    setFieldErrors({});
  }, [open, order]);

  const pricing = useMemo(
    () => calculateAdminOrderPricing(items, shippingFee, orderDiscount),
    [items, shippingFee, orderDiscount]
  );

  const availableProducts = pickerProducts;

  function updateItem(index, patch) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? normalizeAdminOrderItem({ ...item, ...patch }) : item
      )
    );
  }

  function removeItem(index) {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function handleAddProduct() {
    const product = pickerProducts.find((entry) => entry._id === addProductId);
    if (!product) return;

    const line = buildProductLine(product);
    const key = getOrderItemKey(line);
    const existingIndex = items.findIndex((item) => getOrderItemKey(item) === key);

    if (existingIndex >= 0) {
      updateItem(existingIndex, { quantity: items[existingIndex].quantity + 1 });
    } else {
      setItems((current) => [...current, line]);
    }

    setAddProductId("");
  }

  function handleClose() {
    if (isPending) return;
    onClose();
  }

  function validateForm() {
    const errors = {};

    if (!name.trim()) errors.name = "Name is required.";
    if (!phone.trim()) errors.phone = "Phone is required.";
    if (!address.trim()) errors.address = "Address is required.";
    if (items.length === 0) errors.items = "Add at least one product.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    if (!validateForm()) return;

    updateOrder(
      {
        id: order._id,
        payload: {
          status,
          customer: {
            name,
            phone,
            address,
            delivery_area: deliveryArea.trim(),
          },
          delivery: {
            method: deliveryMethod,
            area: deliveryArea.trim(),
            charge: Number(shippingFee) || 0,
          },
          items: pricing.items,
          pricing: {
            subtotal: pricing.subtotal,
            discount: pricing.discount,
            delivery_charge: pricing.shipping,
            total: pricing.total,
          },
        },
      },
      {
        onSuccess: () => onClose(),
        onError: (error) => setSubmitError(error.message || "Update failed."),
      }
    );
  }

  if (!order) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="lg"
      scroll="paper"
      PaperProps={{ sx: { maxHeight: "92dvh" } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, pr: 1 }}>
        <Typography variant="h6" fontWeight={700} noWrap>
          Edit Order {formatDisplayOrderNumber(order.order_number)}
        </Typography>
        <IconButton aria-label="Close modal" onClick={handleClose} size="small">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        <DialogContent dividers sx={{ pt: 2.5 }}>
          <Stack spacing={3}>
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              }}
            >
              <FormControl fullWidth size="small">
                <InputLabel id="order-edit-status-label">Status</InputLabel>
                <Select
                  labelId="order-edit-status-label"
                  label="Status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  {ORDER_STATUSES.map((entry) => (
                    <MenuItem key={entry.value} value={entry.value}>
                      {entry.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel id="order-edit-delivery-label">Delivery Method</InputLabel>
                <Select
                  labelId="order-edit-delivery-label"
                  label="Delivery Method"
                  value={deliveryMethod}
                  onChange={(event) => {
                    const method = event.target.value;
                    setDeliveryMethod(method);
                    const option = deliveryOptions.find((entry) => entry.id === method);
                    setShippingFee(option?.charge ?? 0);
                  }}
                >
                  {deliveryOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Paper variant="outlined" sx={{ overflow: "hidden" }}>
              <MobileCardList>
                <Stack spacing={1.5} sx={{ p: 1.5 }}>
                  {items.map((item, index) => (
                    <Paper
                      key={`mobile-${item.product_id}-${item.selected_variant}-${index}`}
                      variant="outlined"
                      sx={{ p: 1.5 }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        <ProductThumb item={item} />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="body2" fontWeight={600} sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {item.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatVariantDisplay(item)}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          color="error"
                          aria-label="Remove item"
                          onClick={() => removeItem(index)}
                          sx={{ bgcolor: "error.main", color: "common.white", borderRadius: 1, "&:hover": { bgcolor: "error.dark" } }}
                        >
                          <CloseRoundedIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                      <Box
                        sx={{
                          mt: 1.5,
                          display: "grid",
                          gap: 1,
                          gridTemplateColumns: "1fr 1fr",
                        }}
                      >
                        <TextField
                          label="Qty"
                          type="number"
                          size="small"
                          inputProps={{ min: 1, max: 999 }}
                          value={item.quantity}
                          onChange={(event) => updateItem(index, { quantity: event.target.value })}
                        />
                        <TextField
                          label="Price"
                          type="number"
                          size="small"
                          inputProps={{ min: 0, step: "0.01" }}
                          value={item.price}
                          onChange={(event) => updateItem(index, { price: event.target.value })}
                        />
                        <TextField
                          label="Discount"
                          type="number"
                          size="small"
                          inputProps={{ min: 0, step: "0.01" }}
                          value={item.discount}
                          onChange={(event) => updateItem(index, { discount: event.target.value })}
                        />
                        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: "uppercase" }}>
                            Sub Total
                          </Typography>
                          <Typography variant="body2" fontWeight={800}>
                            ৳{item.line_total.toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              </MobileCardList>

              <DesktopTable>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.50" }}>
                      <TableCell>Image</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Color / Size</TableCell>
                      <TableCell sx={{ width: 88 }}>Qty</TableCell>
                      <TableCell sx={{ width: 110 }}>Sell Price</TableCell>
                      <TableCell sx={{ width: 110 }}>Discount</TableCell>
                      <TableCell sx={{ width: 110 }}>Sub Total</TableCell>
                      <TableCell align="center" sx={{ width: 64 }}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={`${item.product_id}-${item.selected_variant}-${index}`}>
                        <TableCell>
                          <ProductThumb item={item} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {item.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatVariantDisplay(item)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            inputProps={{ min: 1, max: 999 }}
                            value={item.quantity}
                            onChange={(event) => updateItem(index, { quantity: event.target.value })}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            inputProps={{ min: 0, step: "0.01" }}
                            value={item.price}
                            onChange={(event) => updateItem(index, { price: event.target.value })}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            inputProps={{ min: 0, step: "0.01" }}
                            value={item.discount}
                            onChange={(event) => updateItem(index, { discount: event.target.value })}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            ৳{item.line_total.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            aria-label="Remove item"
                            onClick={() => removeItem(index)}
                            sx={{ bgcolor: "error.main", color: "common.white", borderRadius: 1, "&:hover": { bgcolor: "error.dark" } }}
                          >
                            <CloseRoundedIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </DesktopTable>

              {fieldErrors.items ? (
                <Typography variant="body2" color="error" sx={{ borderTop: 1, borderColor: "divider", px: 1.5, py: 1 }}>
                  {fieldErrors.items}
                </Typography>
              ) : null}

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{ alignItems: { sm: "center" }, borderTop: 1, borderColor: "divider", bgcolor: "grey.50", p: 1.5 }}
              >
                <TextField
                  type="search"
                  size="small"
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  placeholder="Search products..."
                  sx={{ maxWidth: { sm: 240 }, width: 1 }}
                />
                <FormControl size="small" sx={{ maxWidth: { sm: 360 }, width: 1 }}>
                  <InputLabel id="order-add-product-label">Add product...</InputLabel>
                  <Select
                    labelId="order-add-product-label"
                    label="Add product..."
                    value={addProductId}
                    onChange={(event) => setAddProductId(event.target.value)}
                  >
                    <MenuItem value="">
                      <em>Add product...</em>
                    </MenuItem>
                    {availableProducts.map((product) => (
                      <MenuItem key={product._id} value={product._id}>
                        {product.title_bn || product.title_en}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<AddRoundedIcon />}
                  onClick={handleAddProduct}
                  disabled={!addProductId}
                  sx={{ flexShrink: 0 }}
                >
                  Add Product
                </Button>
              </Stack>
            </Paper>

            <Box
              sx={{
                display: "grid",
                gap: 3,
                gridTemplateColumns: { xs: "1fr", lg: "minmax(0,1fr) 280px" },
              }}
            >
              <Stack spacing={2}>
                <Box>
                  <TextField
                    label="Customer Name"
                    fullWidth
                    size="small"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                  <FieldError message={fieldErrors.name} />
                </Box>
                <Box>
                  <TextField
                    label="Phone"
                    fullWidth
                    size="small"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                  <FieldError message={fieldErrors.phone} />
                </Box>
                <Box>
                  <TextField
                    label="Address"
                    fullWidth
                    size="small"
                    multiline
                    rows={3}
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                  />
                  <FieldError message={fieldErrors.address} />
                </Box>
                <TextField
                  label="Delivery Area"
                  fullWidth
                  size="small"
                  value={deliveryArea}
                  onChange={(event) => setDeliveryArea(event.target.value)}
                  placeholder="Delivery Area"
                />
              </Stack>

              <Paper variant="outlined" sx={{ bgcolor: "grey.50", p: 2 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Sub Total
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    ৳{pricing.subtotal.toLocaleString()}
                  </Typography>
                </Stack>
                {pricing.itemDiscount > 0 ? (
                  <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                    <Typography variant="body2" color="success.main">
                      Item Discount
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="success.main">
                      -৳{pricing.itemDiscount.toLocaleString()}
                    </Typography>
                  </Stack>
                ) : null}
                <TextField
                  label="Shipping Fee"
                  type="number"
                  size="small"
                  fullWidth
                  sx={{ mt: 2 }}
                  inputProps={{ min: 0, step: "0.01" }}
                  value={shippingFee}
                  onChange={(event) => setShippingFee(event.target.value)}
                />
                <TextField
                  label="Discount"
                  type="number"
                  size="small"
                  fullWidth
                  sx={{ mt: 1.5 }}
                  inputProps={{ min: 0, step: "0.01" }}
                  value={orderDiscount}
                  onChange={(event) => setOrderDiscount(event.target.value)}
                />
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mt: 2, pt: 1.5, borderTop: 1, borderColor: "divider" }}
                >
                  <Typography fontWeight={800}>Total</Typography>
                  <Typography variant="h6" fontWeight={800} color="primary.main">
                    ৳{pricing.total.toLocaleString()}
                  </Typography>
                </Stack>
              </Paper>
            </Box>

            {submitError ? (
              <Paper variant="outlined" sx={{ borderColor: "error.light", bgcolor: "rgba(211, 47, 47, 0.04)", px: 1.5, py: 1 }}>
                <Typography variant="body2" color="error.main">
                  {submitError}
                </Typography>
              </Paper>
            ) : null}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, flexDirection: { xs: "column-reverse", sm: "row" }, gap: 1 }}>
          <Button type="button" variant="outlined" color="inherit" onClick={handleClose} disabled={isPending} sx={{ width: { xs: 1, sm: "auto" } }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending}
            startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ width: { xs: 1, sm: "auto" } }}
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
