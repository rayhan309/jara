"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminOrderKeys,
  deleteAdminOrder,
  fetchAdminOrders,
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
