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

export function useAdminOrders(options = {}) {
  return useQuery({
    queryKey: adminOrderKeys.list(),
    queryFn: fetchAdminOrders,
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useUpdateAdminOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => updateAdminOrder(id, payload),
    onSuccess: (order) => {
      queryClient.setQueryData(adminOrderKeys.list(), (current = []) =>
        current.map((item) => (item._id === order._id ? order : item))
      );
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
    },
  });
}
