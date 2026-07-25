import OrdersTrackingView from "@/components/orders/OrdersTrackingView";
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "অর্ডার ট্র্যাকিং",
  description:
    "আপনার Raisa's Glam Nest অর্ডারের বর্তমান স্ট্যাটাস ও ডেলিভারি আপডেট ফোন নম্বর দিয়ে দেখুন।",
  path: "/orders-traking",
  keywords: ["order tracking", "delivery status", "অর্ডার ট্র্যাক", "ডেলিভারি"],
});

export default function OrdersTrackingPage() {
  return <OrdersTrackingView />;
}
