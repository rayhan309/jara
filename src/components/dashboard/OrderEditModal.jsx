"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Loader2, Plus, ShoppingBag, X } from "lucide-react";
import { FieldError } from "@/components/dashboard/DashboardFormUi";
import { useUpdateAdminOrder } from "@/hooks/useAdminOrders";
import { useProducts } from "@/hooks/useProducts";
import {
  calculateAdminOrderPricing,
  formatVariantDisplay,
  getOrderItemKey,
  normalizeAdminOrderItem,
} from "@/lib/adminOrderHelpers";
import { DEFAULT_ORDER_STATUS, ORDER_STATUSES } from "@/lib/orderHelpers";
import { getDefaultProductVariant, getProductVariantConfig } from "@/lib/productVariants";
import { DELIVERY_OPTIONS } from "@/lib/orderValidation";
import { mobileDashModalClass } from "@/components/shared/ResponsiveTable";

const inputClass =
  "w-full rounded-md border border-dash-border bg-white px-3 py-2.5 text-sm text-dash-text outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

const tableInputClass =
  "w-full min-w-0 rounded-md border border-dash-border bg-white px-2 py-1.5 text-sm text-dash-text outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100";

const labelClass = "mb-1.5 block text-sm font-semibold text-dash-text";

function ModalShell({ open, title, onClose, children }) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            className={`${mobileDashModalClass} sm:max-w-6xl`}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-dash-border px-5 py-4">
              <h2 className="text-lg font-bold text-dash-text">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-md text-dash-muted transition-colors hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function mapOrderItemToDraft(item) {
  return normalizeAdminOrderItem({
    ...item,
    discount: item.discount ?? 0,
  });
}

function buildProductLine(product) {
  const variantConfig = getProductVariantConfig(product);
  const selectedVariant = getDefaultProductVariant(product);

  return normalizeAdminOrderItem({
    product_id: product._id,
    slug: product.slug,
    title: product.title_bn || product.title_en,
    title_en: product.title_en,
    image: product.images?.[0]?.url || "",
    price: product.pricing?.sale_price ?? 0,
    regular_price: product.pricing?.regular_price ?? product.pricing?.sale_price ?? 0,
    quantity: 1,
    discount: 0,
    selected_variant: selectedVariant,
    variant_type: variantConfig.type || "",
  });
}

export default function OrderEditModal({ open, onClose, order }) {
  const { mutate: updateOrder, isPending } = useUpdateAdminOrder();
  const { data: products = [] } = useProducts();

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
    setSubmitError("");
    setFieldErrors({});
  }, [open, order]);

  const pricing = useMemo(
    () => calculateAdminOrderPricing(items, shippingFee, orderDiscount),
    [items, shippingFee, orderDiscount]
  );

  const availableProducts = products;

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
    const product = products.find((entry) => entry._id === addProductId);
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
    <ModalShell open={open} title={`Edit Order ${order.order_number}`} onClose={handleClose}>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="space-y-6 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className={inputClass}
              >
                {ORDER_STATUSES.map((entry) => (
                  <option key={entry.value} value={entry.value}>
                    {entry.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Delivery Method</label>
              <select
                value={deliveryMethod}
                onChange={(event) => {
                  const method = event.target.value;
                  setDeliveryMethod(method);
                  setShippingFee(DELIVERY_OPTIONS[method]?.charge ?? 0);
                }}
                className={inputClass}
              >
                {Object.entries(DELIVERY_OPTIONS).map(([key, option]) => (
                  <option key={key} value={key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-dash-border">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-dash-border bg-slate-50 text-[11px] font-semibold tracking-wide text-dash-muted uppercase">
                    <th className="px-3 py-2.5">Image</th>
                    <th className="min-w-[140px] px-3 py-2.5">Name</th>
                    <th className="min-w-[100px] px-3 py-2.5">Color / Size</th>
                    <th className="w-20 px-3 py-2.5">Qty</th>
                    <th className="w-24 px-3 py-2.5">Sell Price</th>
                    <th className="w-24 px-3 py-2.5">Discount</th>
                    <th className="w-24 px-3 py-2.5">Sub Total</th>
                    <th className="w-14 px-3 py-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={`${item.product_id}-${item.selected_variant}-${index}`} className="border-b border-dash-border last:border-b-0">
                      <td className="px-3 py-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-md bg-slate-100">
                          {item.image ? (
                            <Image src={item.image} alt={item.title} fill unoptimized className="object-contain p-1" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-dash-muted">
                              <ShoppingBag className="h-4 w-4 opacity-40" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 font-medium text-dash-text">{item.title}</td>
                      <td className="px-3 py-3 text-dash-muted">{formatVariantDisplay(item)}</td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          min={1}
                          max={999}
                          value={item.quantity}
                          onChange={(event) => updateItem(index, { quantity: event.target.value })}
                          className={tableInputClass}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={item.price}
                          onChange={(event) => updateItem(index, { price: event.target.value })}
                          className={tableInputClass}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={item.discount}
                          onChange={(event) => updateItem(index, { discount: event.target.value })}
                          className={tableInputClass}
                        />
                      </td>
                      <td className="px-3 py-3 font-semibold text-dash-text">
                        ৳{item.line_total.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-red-500 text-white transition-colors hover:bg-red-600"
                          aria-label="Remove item"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {fieldErrors.items ? (
              <p className="border-t border-dash-border px-3 py-2 text-sm text-red-600">{fieldErrors.items}</p>
            ) : null}

            <div className="flex flex-col gap-2 border-t border-dash-border bg-slate-50 p-3 sm:flex-row sm:items-center">
              <select
                value={addProductId}
                onChange={(event) => setAddProductId(event.target.value)}
                className={`${inputClass} sm:max-w-md`}
              >
                <option value="">Add product...</option>
                {availableProducts.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.title_bn || product.title_en}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddProduct}
                disabled={!addProductId}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Customer Name</label>
                <input value={name} onChange={(event) => setName(event.target.value)} className={inputClass} />
                <FieldError message={fieldErrors.name} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input value={phone} onChange={(event) => setPhone(event.target.value)} className={inputClass} />
                <FieldError message={fieldErrors.phone} />
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className={`${inputClass} resize-none`}
                />
                <FieldError message={fieldErrors.address} />
              </div>
              <div>
                <label className={labelClass}>Delivery Area</label>
                <input
                  value={deliveryArea}
                  onChange={(event) => setDeliveryArea(event.target.value)}
                  placeholder="Delivery Area"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="rounded-md border border-dash-border bg-slate-50 p-4 text-sm">
              <div className="flex justify-between text-dash-muted">
                <span>Sub Total</span>
                <span className="font-semibold text-dash-text">৳{pricing.subtotal.toLocaleString()}</span>
              </div>
              {pricing.itemDiscount > 0 ? (
                <div className="mt-2 flex justify-between text-emerald-600">
                  <span>Item Discount</span>
                  <span className="font-semibold">-৳{pricing.itemDiscount.toLocaleString()}</span>
                </div>
              ) : null}
              <div className="mt-3">
                <label className="mb-1 block text-xs font-semibold text-dash-muted">Shipping Fee</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={shippingFee}
                  onChange={(event) => setShippingFee(event.target.value)}
                  className={tableInputClass}
                />
              </div>
              <div className="mt-3">
                <label className="mb-1 block text-xs font-semibold text-dash-muted">Discount</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={orderDiscount}
                  onChange={(event) => setOrderDiscount(event.target.value)}
                  className={tableInputClass}
                />
              </div>
              <div className="mt-4 flex justify-between border-t border-dash-border pt-3">
                <span className="font-bold text-dash-text">Total</span>
                <span className="text-lg font-bold text-indigo-600">৳{pricing.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {submitError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {submitError}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-dash-border bg-white p-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="rounded-md border border-dash-border px-4 py-2.5 text-sm font-semibold text-dash-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
