"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  categoryKeys,
  createCategory,
  fetchCategories,
  updateCategory,
  deleteCategory,
} from "@/lib/api/categories";

export {
  categoryKeys,
  fetchCategories,
  createCategory,
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
    onSuccess: (category) => {
      queryClient.setQueryData(categoryKeys.list(), (current = []) => [category, ...current]);
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }) => updateCategory(id, formData),
    onSuccess: (category) => {
      queryClient.setQueryData(categoryKeys.list(), (current = []) =>
        current.map((item) => (item._id === category._id ? category : item))
      );
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: (id) => {
      queryClient.setQueryData(categoryKeys.list(), (current = []) =>
        current.filter((item) => item._id !== id)
      );
    },
  });
}
