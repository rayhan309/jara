"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProductAttribute,
  deleteProductAttribute,
  fetchProductAttributes,
  productAttributeKeys,
  updateProductAttribute,
} from "@/lib/api/productAttributes";

export function useProductAttributes(options = {}) {
  return useQuery({
    queryKey: productAttributeKeys.list(),
    queryFn: fetchProductAttributes,
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useCreateProductAttribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProductAttribute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productAttributeKeys.all });
    },
  });
}

export function useUpdateProductAttribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => updateProductAttribute(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productAttributeKeys.all });
    },
  });
}

export function useDeleteProductAttribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProductAttribute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productAttributeKeys.all });
    },
  });
}
