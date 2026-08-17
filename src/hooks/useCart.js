"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  addToCart as addProductToCart,
  buyNow as buyProductNow,
  clearCart as clearProductCart,
  CART_EVENT,
  getCartCount,
  getCartItems,
  getProductMaxStock,
  isProductInCart,
  removeFromCart as removeProductFromCart,
  updateCartQuantity as updateProductCartQuantity,
  updateCartVariant as updateProductCartVariant,
} from "@/lib/cart";
import { resolveProductVariant } from "@/lib/productVariants";

function productTitle(product) {
  return product.title_bn || product.title_en || product.title || "পণ্য";
}

function stockLimitMessage(maxStock) {
  return `স্টকে মাত্র ${maxStock}টি আছে`;
}

export function useCart() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);

  const syncCart = useCallback(() => {
    setItems(getCartItems());
    setCount(getCartCount());
  }, []);

  useEffect(() => {
    syncCart();
    window.addEventListener(CART_EVENT, syncCart);
    return () => window.removeEventListener(CART_EVENT, syncCart);
  }, [syncCart]);

  const addToCart = useCallback(
    (product, quantity = 1, selectedVariant = "") => {
      const variant = resolveProductVariant(product, selectedVariant);
      const maxStock = getProductMaxStock(product, variant);

      if (maxStock <= 0) {
        toast.error("এই পণ্যটি স্টকে নেই");
        return false;
      }

      const result = addProductToCart(product, quantity, variant);
      syncCart();

      if (!result.ok) {
        if (result.reason === "max_stock") {
          toast.error(stockLimitMessage(result.maxStock));
        }
        return false;
      }

      const title = productTitle(product);
      const variantNote = variant ? ` (${variant})` : "";
      if (result.limited) {
        toast.success(`${title}${variantNote} কার্টে যোগ হয়েছে (${stockLimitMessage(result.maxStock)})`);
      } else {
        toast.success(`${title}${variantNote} কার্টে যোগ হয়েছে`);
      }
      return true;
    },
    [syncCart]
  );

  const toggleCart = useCallback(
    (product) => {
      const variant = resolveProductVariant(product);
      const maxStock = getProductMaxStock(product, variant);

      if (maxStock <= 0) {
        toast.error("এই পণ্যটি স্টকে নেই");
        return false;
      }

      if (isProductInCart(product._id, variant)) {
        removeProductFromCart(product._id, variant);
        syncCart();
        toast(`${productTitle(product)} কার্ট থেকে সরানো হয়েছে`);
        return true;
      }

      return addToCart(product, 1, variant);
    },
    [addToCart, syncCart]
  );

  const removeFromCart = useCallback(
    (productId, title, selectedVariant = "") => {
      removeProductFromCart(productId, selectedVariant);
      syncCart();
      if (title) {
        toast(`${title} কার্ট থেকে সরানো হয়েছে`);
      } else {
        toast("কার্ট থেকে সরানো হয়েছে");
      }
    },
    [syncCart]
  );

  const updateQuantity = useCallback(
    (productId, quantity, title, selectedVariant = "") => {
      const result = updateProductCartQuantity(productId, quantity, selectedVariant);
      syncCart();

      if (!result.ok) {
        if (result.reason === "max_stock") {
          toast.error(stockLimitMessage(result.maxStock));
        }
        return false;
      }

      if (result.removed && title) {
        toast(`${title} কার্ট থেকে সরানো হয়েছে`);
      }
      return true;
    },
    [syncCart]
  );

  const updateVariant = useCallback(
    (productId, oldVariant, newVariant, title, product) => {
      const result = updateProductCartVariant(productId, oldVariant, newVariant, product);
      syncCart();

      if (!result.ok) {
        if (result.reason === "max_stock") {
          toast.error(stockLimitMessage(result.maxStock));
        } else if (result.reason === "out_of_stock") {
          toast.error("এই পণ্যটি স্টকে নেই");
        }
        return false;
      }

      if (title && oldVariant !== newVariant) {
        toast.success(`${title} — ${newVariant || "ভ্যারিয়েন্ট"} আপডেট হয়েছে`);
      }
      return true;
    },
    [syncCart]
  );

  const isInCart = useCallback(
    (productId, selectedVariant) => isProductInCart(productId, selectedVariant),
    []
  );

  const clearCart = useCallback(() => {
    clearProductCart();
    syncCart();
  }, [syncCart]);

  const buyNow = useCallback(
    (product, quantity = 1, selectedVariant = "") => {
      const variant = resolveProductVariant(product, selectedVariant);
      const maxStock = getProductMaxStock(product, variant);

      if (maxStock <= 0) {
        toast.error("এই পণ্যটি স্টকে নেই");
        return false;
      }

      const result = buyProductNow(product, quantity, variant);
      syncCart();

      if (!result.ok) {
        if (result.reason === "max_stock") {
          toast.error(stockLimitMessage(result.maxStock));
        }
        return false;
      }

      router.push("/checkout");
      return true;
    },
    [router, syncCart]
  );

  return {
    items,
    count,
    addToCart,
    toggleCart,
    removeFromCart,
    updateQuantity,
    updateVariant,
    isInCart,
    buyNow,
    clearCart,
    syncCart,
    getProductMaxStock,
  };
}
