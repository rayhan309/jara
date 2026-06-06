"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProduct,
  fetchProducts,
  productKeys,
  updateProduct,
  deleteProduct,
} from "@/lib/api/products";

export {
  productKeys,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/api/products";

export function useProducts(options = {}) {
  return useQuery({
    queryKey: productKeys.list(),
    queryFn: fetchProducts,
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: (product) => {
      queryClient.setQueryData(productKeys.list(), (current = []) => [product, ...current]);
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }) => updateProduct(id, formData),
    onSuccess: (product) => {
      queryClient.setQueryData(productKeys.list(), (current = []) =>
        current.map((item) => (item._id === product._id ? product : item))
      );
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: (id) => {
      queryClient.setQueryData(productKeys.list(), (current = []) =>
        current.filter((item) => item._id !== id)
      );
    },
  });
}
