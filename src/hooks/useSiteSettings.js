"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSettings, settingsKeys, updateSettings } from "@/lib/api/settings";

export function useSiteSettings(options = {}) {
  return useQuery({
    queryKey: settingsKeys.detail(),
    queryFn: fetchSettings,
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSettings,
    onSuccess: (settings) => {
      queryClient.setQueryData(settingsKeys.detail(), settings);
    },
  });
}
