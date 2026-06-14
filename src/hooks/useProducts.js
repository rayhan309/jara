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
  const { search = "", category = "all", ...queryOptions } = options;
  const filters = { search, category };

  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => fetchProducts(filters),
    staleTime: 60 * 1000,
    ...queryOptions,
  });
}

export function useProductsList(options = {}) {
  const query = useProducts(options);
  return {
    ...query,
    products: query.data ?? [],
  };
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }) => updateProduct(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
