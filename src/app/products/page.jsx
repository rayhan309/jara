import StoreShell from "@/components/layout/StoreShell";
import StoreProductsView from "@/components/products/StoreProductsView";

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
