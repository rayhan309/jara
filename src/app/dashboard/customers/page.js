import CustomersManager from "@/components/dashboard/CustomersManager";
import { createAdminPageMetadata } from "@/lib/siteMetadata";

export const metadata = createAdminPageMetadata(
  "Customers",
  "Customer directory, purchase history and lifetime value analytics."
);

export default function CustomersPage() {
  return <CustomersManager />;
}
