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

export default function SiteSettingsProvider({ children, className = "" }) {
  const { data: settings = DEFAULT_SETTINGS } = useSiteSettings();
  const themeStyle = useMemo(() => getThemeCssProperties(settings), [settings]);

  useEffect(() => {
    applyThemeToDocument(settings);
  }, [settings]);

  return (
    <SiteSettingsContext.Provider value={settings}>
      <div className={className} style={themeStyle}>
        {children}
      </div>
    </SiteSettingsContext.Provider>
  );
}
