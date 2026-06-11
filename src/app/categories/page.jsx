import StoreShell from "@/components/layout/StoreShell";
import StoreCategoriesView from "@/components/categories/StoreCategoriesView";

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
