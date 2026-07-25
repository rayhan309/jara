import StoreShell from "@/components/layout/StoreShell";
import StoreCategoriesView from "@/components/categories/StoreCategoriesView";
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "ক্যাটাগরি",
  description:
    "Raisa's Glam Nest-এর সকল ক্যাটাগরি দেখুন এবং আপনার পছন্দের পণ্য সহজে ব্রাউজ করুন।",
  path: "/categories",
  keywords: ["categories", "catalog", "ক্যাটাগরি", "পণ্যের ধরন"],
});

export default function CategoriesPage() {
  return (
    <StoreShell className="bg-zinc-50">
      <section className="py-6 sm:py-8 lg:py-10">
        <div className="store-container">
          <StoreCategoriesView />
        </div>
      </section>
    </StoreShell>
  );
}
