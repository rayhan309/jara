import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import StoreShell from "@/components/layout/StoreShell";
import StoreProductsView from "@/components/products/StoreProductsView";

function ProductsLoading() {
  return (
    <div className="flex min-h-[320px] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <StoreShell className="bg-zinc-50">
      <section className="py-6 sm:py-8 lg:py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<ProductsLoading />}>
            <StoreProductsView />
          </Suspense>
        </div>
      </section>
    </StoreShell>
  );
}
