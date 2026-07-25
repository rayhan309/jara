import StoreShell from "@/components/layout/StoreShell";
import CheckoutView from "@/components/checkout/CheckoutView";
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "চেকআউট",
  description: "Raisa's Glam Nest-এ আপনার অর্ডার সম্পন্ন করুন — দ্রুত, নিরাপদ ও সহজ চেকআউট প্রক্রিয়া।",
  path: "/checkout",
  noIndex: true,
});

export default function CheckoutPage() {
  return (
    <StoreShell className="bg-zinc-50">
      <div className="store-container py-6 pb-24 sm:py-10 sm:pb-10">
        <CheckoutView />
      </div>
    </StoreShell>
  );
}
