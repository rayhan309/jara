import StoreShell from "@/components/layout/StoreShell";
import CheckoutView from "@/components/checkout/CheckoutView";

export default function CheckoutPage() {
  return (
    <StoreShell className="bg-zinc-50">
      <div className="store-container py-8 pb-24 sm:py-10 sm:pb-10">
        <CheckoutView />
      </div>
    </StoreShell>
  );
}
