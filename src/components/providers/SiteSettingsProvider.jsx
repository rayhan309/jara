"use client";

import { createContext, useContext, useLayoutEffect, useMemo } from "react";
import {
  applyThemeToDocument,
  DEFAULT_SETTINGS,
  getFaviconUrl,
  getThemeCssProperties,
} from "@/lib/siteSettings";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { syncMetaPixelSettings } from "@/lib/metaPixel";

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

  useLayoutEffect(() => {
    applyThemeToDocument(settings);
    syncMetaPixelSettings(settings);

    const faviconUrl = getFaviconUrl(settings);
    const iconSelector = "link[data-dynamic-favicon='true']";
    let iconLink = document.querySelector(iconSelector);

    if (faviconUrl) {
      if (!iconLink) {
        iconLink = document.createElement("link");
        iconLink.rel = "icon";
        iconLink.setAttribute("data-dynamic-favicon", "true");
        document.head.appendChild(iconLink);
      }
      iconLink.href = faviconUrl;
    } else if (iconLink) {
      iconLink.remove();
    }
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
