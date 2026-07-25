"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  WISHLIST_EVENT,
  addToWishlist as addProductToWishlist,
  clearWishlist as clearProductWishlist,
  getWishlistCount,
  getWishlistItems,
  isProductInWishlist,
  removeFromWishlist as removeProductFromWishlist,
  toggleWishlistItem,
} from "@/lib/wishlist";

function productTitle(product) {
  return product.title_bn || product.title_en || product.title || "Product";
}

export function useWishlist() {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);

  const syncWishlist = useCallback(() => {
    setItems(getWishlistItems());
    setCount(getWishlistCount());
  }, []);

  useEffect(() => {
    syncWishlist();
    window.addEventListener(WISHLIST_EVENT, syncWishlist);
    return () => window.removeEventListener(WISHLIST_EVENT, syncWishlist);
  }, [syncWishlist]);

  const addToWishlist = useCallback(
    (product, selectedVariant = "") => {
      const result = addProductToWishlist(product, selectedVariant);
      syncWishlist();
      if (result.added) {
        toast.success(`${productTitle(product)} added to wishlist`);
      }
      return result;
    },
    [syncWishlist]
  );

  const removeFromWishlist = useCallback(
    (productId, title, selectedVariant = "") => {
      removeProductFromWishlist(productId, selectedVariant);
      syncWishlist();
      toast(title ? `${title} removed from wishlist` : "Removed from wishlist");
    },
    [syncWishlist]
  );

  const toggleWishlist = useCallback(
    (product, selectedVariant = "") => {
      const result = toggleWishlistItem(product, selectedVariant);
      syncWishlist();
      if (result.added) {
        toast.success(`${productTitle(product)} added to wishlist`);
      } else {
        toast(`${productTitle(product)} removed from wishlist`);
      }
      return result;
    },
    [syncWishlist]
  );

  const isInWishlist = useCallback(
    (productId, selectedVariant = "") => isProductInWishlist(productId, selectedVariant),
    []
  );

  const clearWishlist = useCallback(() => {
    clearProductWishlist();
    syncWishlist();
  }, [syncWishlist]);

  return {
    items,
    count,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    syncWishlist,
  };
}
