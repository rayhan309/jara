import StoreShell from "@/components/layout/StoreShell";
import CheckoutView from "@/components/checkout/CheckoutView";

export default function CheckoutPage() {
  return (
    <StoreShell className="bg-zinc-50">
      <div className="container mx-auto px-4 py-8 pb-24 sm:px-6 sm:py-10 sm:pb-10 lg:px-8">
        <CheckoutView />
      </div>
    </StoreShell>
  );
}
