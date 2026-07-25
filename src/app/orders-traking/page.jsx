import OrdersTrackingView from "@/components/orders/OrdersTrackingView";
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "Order tracking",
  description:
    "Check your Raisa's Glam Nest order status and delivery updates with your phone number.",
  path: "/orders-traking",
  keywords: ["order tracking", "delivery status", "track order"],
});

export default function OrdersTrackingPage() {
  return <OrdersTrackingView />;
}
