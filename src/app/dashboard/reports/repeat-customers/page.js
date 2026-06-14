import RepeatCustomerReport from "@/components/dashboard/reports/RepeatCustomerReport";
import { createAdminPageMetadata } from "@/lib/siteMetadata";

export const metadata = createAdminPageMetadata(
  "Repeat Customer Report",
  "Review orders from repeat customers."
);

export default function RepeatCustomerReportPage() {
  return <RepeatCustomerReport />;
}
