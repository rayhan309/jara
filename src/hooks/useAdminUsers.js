"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminUserKeys,
  createAdminUser,
  deleteAdminUser,
  fetchAdminProfile,
  fetchAdminUsers,
  updateAdminProfile,
  updateAdminUser,
} from "@/lib/api/adminUsers";

export function useAdminUsers() {
  return useQuery({
    queryKey: adminUserKeys.list(),
    queryFn: fetchAdminUsers,
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminUserKeys.all }),
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateAdminUser(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminUserKeys.all }),
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminUserKeys.all }),
  });
}

export function useAdminProfile() {
  return useQuery({
    queryKey: ["admin-profile"],
    queryFn: fetchAdminProfile,
  });
}

export function useUpdateAdminProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-profile"] }),
  });
}
