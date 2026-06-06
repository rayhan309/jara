import StoreShell from "@/components/layout/StoreShell";
import StoreCategoriesView from "@/components/categories/StoreCategoriesView";

export default function CategoriesPage() {
  return (
    <StoreShell className="bg-zinc-50">
      <section className="py-6 sm:py-8 lg:py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <StoreCategoriesView />
        </div>
      </section>
    </StoreShell>
  );
}
