import ShippingSettings from "@/components/dashboard/settings/ShippingSettings";
import { createAdminPageMetadata } from "@/lib/siteMetadata";

export const metadata = createAdminPageMetadata(
  "Shipping Settings",
  "Manage delivery areas and shipping class charges."
);

export default function ShippingSettingsPage() {
  return <ShippingSettings />;
}
