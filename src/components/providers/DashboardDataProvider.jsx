"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { adminOrderKeys } from "@/lib/api/adminOrders";
import { productKeys } from "@/lib/api/products";
import { adminCustomerKeys, dashboardSummaryKeys } from "@/lib/api/dashboard";

const DEFAULT_PRODUCT_FILTERS = { search: "", category: "all" };

export default function DashboardDataProvider({ children, prefetch = {} }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (prefetch.summary !== undefined) {
      queryClient.setQueryData(dashboardSummaryKeys.detail(), prefetch.summary);
    }

    if (prefetch.customers !== undefined) {
      queryClient.setQueryData(adminCustomerKeys.list(), prefetch.customers);
    }

    if (prefetch.orders !== undefined) {
      queryClient.setQueryData(adminOrderKeys.list(), prefetch.orders);
    }

    if (prefetch.products !== undefined) {
      queryClient.setQueryData(productKeys.list(DEFAULT_PRODUCT_FILTERS), prefetch.products);
    }
  }, [prefetch, queryClient]);

  return children;
}
