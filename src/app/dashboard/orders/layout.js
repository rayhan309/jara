import { createAdminPageMetadata } from "@/lib/siteMetadata";

export const metadata = createAdminPageMetadata(
  "Orders",
  "Manage order fulfillment, status updates and Steadfast courier integration."
);

export default function OrdersLayout({ children }) {
  return children;
}
