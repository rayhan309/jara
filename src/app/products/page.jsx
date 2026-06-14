import StoreShell from "@/components/layout/StoreShell";
import StoreProductsView from "@/components/products/StoreProductsView";
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "সকল পণ্য",
  description:
    "Nexa Commerce-এর সম্পূর্ণ পণ্য তালিকা। ক্যাটাগরি ও সার্চ দিয়ে সহজে পছন্দের পণ্য খুঁজে নিন।",
  path: "/products",
  keywords: ["products", "shop", "online store", "পণ্য", "অনলাইন দোকান"],
});

export default function ProductsPage() {
  return (
    <StoreShell className="bg-zinc-50">
      <section className="py-6 sm:py-8 lg:py-10">
        <div className="store-container">
          <StoreProductsView />
        </div>
      </section>
    </StoreShell>
  );
}
