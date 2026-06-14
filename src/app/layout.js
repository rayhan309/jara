import { hindSiliguri } from "@/lib/fonts";
import QueryProvider from "@/components/providers/QueryProvider";
import CategoriesProvider from "@/components/providers/CategoriesProvider";
import ToastProvider from "@/components/providers/ToastProvider";
import SiteSettingsProvider from "@/components/providers/SiteSettingsProvider";
import SiteSettingsHead from "@/components/layout/SiteSettingsHead";
import { getCategories } from "@/lib/categoriesServer";
import { getSiteSettings } from "@/lib/siteSettingsServer";
import { getThemeCssProperties } from "@/lib/siteSettings";
import "./globals.css";

export const metadata = {
  title: "Nexa E-Commerce",
  description: "Nexa E-Commerce — দ্রুত ডেলিভারি ও অর্ডার ট্র্যাকিং সহ অনলাইন শপিং",
};

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
    >
      <head>
        <SiteSettingsHead settings={settings} />
      </head>
      <body className={`${hindSiliguri.className} min-h-full flex flex-col`}>
        <QueryProvider initialCategories={categories}>
          <CategoriesProvider initialCategories={categories}>
            <SiteSettingsProvider initialSettings={settings}>
              {children}
              <ToastProvider />
            </SiteSettingsProvider>
          </CategoriesProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
