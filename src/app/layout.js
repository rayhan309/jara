import { hindSiliguri } from "@/lib/fonts";
import QueryProvider from "@/components/providers/QueryProvider";
import CategoriesProvider from "@/components/providers/CategoriesProvider";
import ToastProvider from "@/components/providers/ToastProvider";
import SiteSettingsProvider from "@/components/providers/SiteSettingsProvider";
import AppMuiCacheProvider from "@/components/providers/AppMuiCacheProvider";
import SiteSettingsHead from "@/components/layout/SiteSettingsHead";
import { getCategories } from "@/lib/categoriesServer";
import { getSiteSettings } from "@/lib/siteSettingsServer";
import { getFaviconUrl, getThemeCssProperties } from "@/lib/siteSettings";
import { rootMetadata } from "@/lib/siteMetadata";
import "./globals.css";

export async function generateMetadata() {
  const settings = await getSiteSettings();
  const faviconUrl = getFaviconUrl(settings);

  return {
    ...rootMetadata,
    icons: {
      icon: [
        { url: faviconUrl, type: "image/png" },
        { url: "/icon.svg", type: "image/svg+xml" },
      ],
      apple: [{ url: faviconUrl, type: "image/png" }],
      shortcut: [{ url: faviconUrl, type: "image/png" }],
    },
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }) {
  const [settings, categories] = await Promise.all([getSiteSettings(), getCategories()]);
  const themeStyle = getThemeCssProperties(settings);

  return (
    <html
      lang="bn"
      className={`${hindSiliguri.variable} h-full antialiased`}
      style={themeStyle}
      suppressHydrationWarning
    >
      <head>
        <SiteSettingsHead settings={settings} />
      </head>
      <body className={`${hindSiliguri.className} min-h-full flex flex-col`} suppressHydrationWarning>
        <AppMuiCacheProvider>
          <QueryProvider initialCategories={categories}>
            <CategoriesProvider initialCategories={categories}>
              <SiteSettingsProvider initialSettings={settings}>
                {children}
                <ToastProvider />
              </SiteSettingsProvider>
            </CategoriesProvider>
          </QueryProvider>
        </AppMuiCacheProvider>
      </body>
    </html>
  );
}
