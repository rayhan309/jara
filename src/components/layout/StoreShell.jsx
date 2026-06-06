import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function StoreShell({ children, className = "" }) {
  return (
    <div className={`font-store flex min-h-screen min-w-0 flex-col overflow-x-clip bg-white ${className}`}>
      <Navbar />
      <main className="min-w-0 flex-1">{children}</main>
      <Footer />
    </div>
  );
}
