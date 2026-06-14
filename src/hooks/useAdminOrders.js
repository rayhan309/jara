"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminOrderKeys,
  deleteAdminOrder,
  fetchAdminOrders,
  sendBulkOrdersToSteadfast,
  sendOrderToSteadfast,
  updateAdminOrder,
} from "@/lib/api/adminOrders";
import { adminCustomerKeys, dashboardSummaryKeys } from "@/lib/api/dashboard";

function invalidateDashboardCaches(queryClient) {
  queryClient.invalidateQueries({ queryKey: dashboardSummaryKeys.all });
  queryClient.invalidateQueries({ queryKey: adminCustomerKeys.all });
}

export function useAdminOrders(options = {}) {
  return useQuery({
    queryKey: adminOrderKeys.list(),
    queryFn: fetchAdminOrders,
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useAdminOrdersList(options = {}) {
  const query = useAdminOrders(options);
  return {
    ...query,
    orders: query.data ?? [],
  };
}

export function useUpdateAdminOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => updateAdminOrder(id, payload),
    onSuccess: (order) => {
      queryClient.setQueryData(adminOrderKeys.list(), (current = []) =>
        current.map((item) => (item._id === order._id ? order : item))
      );
      invalidateDashboardCaches(queryClient);
    },
  });
}

export function useDeleteAdminOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminOrder,
    onSuccess: (id) => {
      queryClient.setQueryData(adminOrderKeys.list(), (current = []) =>
        current.filter((item) => item._id !== id)
      );
      invalidateDashboardCaches(queryClient);
    },
  });
}

function mergeOrdersIntoList(current = [], orders = []) {
  const map = new Map(orders.map((order) => [order._id, order]));
  return current.map((item) => map.get(item._id) || item);
}

export function useSendOrderToSteadfast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendOrderToSteadfast,
    onSuccess: (order) => {
      queryClient.setQueryData(adminOrderKeys.list(), (current = []) =>
        current.map((item) => (item._id === order._id ? order : item))
      );
      invalidateDashboardCaches(queryClient);
    },
  });
}

export function useSendBulkOrdersToSteadfast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendBulkOrdersToSteadfast,
    onSuccess: (data) => {
      const updatedOrders = (data.results || [])
        .filter((entry) => entry.success && entry.order)
        .map((entry) => entry.order);

      if (!updatedOrders.length) return;

      queryClient.setQueryData(adminOrderKeys.list(), (current = []) =>
        mergeOrdersIntoList(current, updatedOrders)
      );
      invalidateDashboardCaches(queryClient);
    },
  });
}
