"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  clientReviewKeys,
  createClientReview,
  deleteClientReview,
  fetchAdminClientReviews,
  fetchPublicClientReviews,
  updateClientReview,
} from "@/lib/api/clientReviews";

export function usePublicClientReviews(options = {}) {
  return useQuery({
    queryKey: clientReviewKeys.public(),
    queryFn: fetchPublicClientReviews,
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useAdminClientReviews(options = {}) {
  return useQuery({
    queryKey: clientReviewKeys.admin(),
    queryFn: fetchAdminClientReviews,
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useCreateClientReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClientReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientReviewKeys.all });
    },
  });
}

export function useUpdateClientReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => updateClientReview(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientReviewKeys.all });
    },
  });
}

export function useDeleteClientReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteClientReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientReviewKeys.all });
    },
  });
}
