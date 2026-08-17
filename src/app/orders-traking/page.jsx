import OrdersTrackingView from "@/components/orders/OrdersTrackingView";
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "অর্ডার ট্র্যাকিং",
  description:
    "ফোন নম্বর দিয়ে Jara অর্ডারের স্ট্যাটাস ও ডেলিভারি আপডেট দেখুন।",
  path: "/orders-traking",
  keywords: ["অর্ডার ট্র্যাকিং", "ডেলিভারি স্ট্যাটাস", "অর্ডার খুঁজুন"],
});

export default function OrdersTrackingPage() {
  return <OrdersTrackingView />;
}
