import { hindSiliguri } from "@/lib/fonts";
import QueryProvider from "@/components/providers/QueryProvider";
import ToastProvider from "@/components/providers/ToastProvider";
import SiteSettingsProvider from "@/components/providers/SiteSettingsProvider";
import SiteSettingsHead from "@/components/layout/SiteSettingsHead";
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
  const settings = await getSiteSettings();
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
        <QueryProvider>
          <SiteSettingsProvider initialSettings={settings}>
            {children}
            <ToastProvider />
          </SiteSettingsProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
