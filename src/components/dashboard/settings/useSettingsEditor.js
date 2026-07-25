"use client";

import toast from "react-hot-toast";
import { applyThemeToDocument } from "@/lib/siteSettings";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/useSiteSettings";

export function useSettingsEditor() {
  const { data: settings, isLoading, isError, error, refetch } = useSiteSettings();
  const { mutate: saveSettings, isPending } = useUpdateSiteSettings();

  function save(partial, { onSuccess, successMessage = "Settings saved successfully" } = {}) {
    if (!settings) {
      toast.error("Settings have not loaded yet");
      return;
    }

    saveSettings(
      { ...settings, ...partial },
      {
        onSuccess: (savedSettings) => {
          applyThemeToDocument(savedSettings);
          toast.success(successMessage);
          onSuccess?.(savedSettings);
        },
        onError: (saveError) => toast.error(saveError.message || "Save failed"),
      }
    );
  }

  return {
    settings,
    isLoading,
    isError,
    error,
    refetch,
    save,
    isPending,
  };
}
