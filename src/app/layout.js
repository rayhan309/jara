import { hindSiliguri, poppins } from "@/lib/fonts";
import QueryProvider from "@/components/providers/QueryProvider";
import ToastProvider from "@/components/providers/ToastProvider";
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

export default function RootLayout({ children }) {
  return (
    <html
      lang="bn"
      className={`${hindSiliguri.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          {children}
          <ToastProvider />
        </QueryProvider>
      </body>
    </html>
  );
}
