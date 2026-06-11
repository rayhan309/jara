"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import {
  applyThemeToDocument,
  DEFAULT_SETTINGS,
  getThemeCssProperties,
} from "@/lib/siteSettings";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const SiteSettingsContext = createContext(DEFAULT_SETTINGS);

export function useStoreSettings() {
  return useContext(SiteSettingsContext);
}

export default function SiteSettingsProvider({
  children,
  className = "",
  initialSettings = DEFAULT_SETTINGS,
}) {
  const { data: settings = initialSettings } = useSiteSettings({
    initialData: initialSettings,
  });
  const themeStyle = useMemo(() => getThemeCssProperties(settings), [settings]);

  useEffect(() => {
    applyThemeToDocument(settings);
  }, [settings]);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {className ? (
        <div className={className} style={themeStyle}>
          {children}
        </div>
      ) : (
        children
      )}
    </SiteSettingsContext.Provider>
  );
}
