import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackToTopButton from "@/components/layout/BackToTopButton";
import SiteSettingsProvider from "@/components/providers/SiteSettingsProvider";

export default function StoreShell({ children, className = "" }) {
  return (
    <SiteSettingsProvider
      className={`font-store flex min-h-screen min-w-0 flex-col overflow-x-clip bg-white ${className}`}
    >
      <Navbar />
      <main className="min-w-0 flex-1">{children}</main>
      <Footer />
      <BackToTopButton />
    </SiteSettingsProvider>
  );
}
