"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { categoryKeys } from "@/lib/api/categories";

export default function QueryProvider({ children, initialCategories }) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    });

    if (initialCategories !== undefined) {
      client.setQueryData(categoryKeys.list(), initialCategories);
    }

    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
