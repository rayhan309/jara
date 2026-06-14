"use client";

import { useQuery } from "@tanstack/react-query";
import {
  adminCustomerKeys,
  dashboardSummaryKeys,
  fetchAdminCustomers,
  fetchDashboardSummary,
  fetchProductPicker,
} from "@/lib/api/dashboard";

export function useDashboardSummary(options = {}) {
  return useQuery({
    queryKey: dashboardSummaryKeys.detail(),
    queryFn: fetchDashboardSummary,
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useAdminCustomers(options = {}) {
  return useQuery({
    queryKey: adminCustomerKeys.list(),
    queryFn: fetchAdminCustomers,
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useProductPicker(search = "", options = {}) {
  return useQuery({
    queryKey: ["admin-product-picker", search],
    queryFn: () => fetchProductPicker(search),
    staleTime: 60 * 1000,
    ...options,
  });
}
