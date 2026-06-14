import DashboardOverview from "@/components/dashboard/DashboardOverview";
import { createAdminPageMetadata } from "@/lib/siteMetadata";

export const metadata = createAdminPageMetadata(
  "Overview",
  "Store performance overview — revenue, orders, products and recent activity."
);

export default function DashboardPage() {
  return <DashboardOverview />;
}
