"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  categoryKeys,
  createCategory,
  fetchCategories,
  reorderCategories,
  updateCategory,
  deleteCategory,
} from "@/lib/api/categories";

export {
  categoryKeys,
  fetchCategories,
  createCategory,
  reorderCategories,
  updateCategory,
  deleteCategory,
} from "@/lib/api/categories";
export function useCategories(options = {}) {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: fetchCategories,
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }) => updateCategory(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

export function useReorderCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reorderCategories,
    onSuccess: (categories) => {
      queryClient.setQueryData(categoryKeys.list(), categories);
    },
  });
}
