import SteadfastSettings from "@/components/dashboard/settings/SteadfastSettings";
import { createAdminPageMetadata } from "@/lib/siteMetadata";

export const metadata = createAdminPageMetadata(
  "Steadfast Courier",
  "Configure Steadfast API credentials for automated order shipping."
);

export default function SteadfastSettingsPage() {
  return <SteadfastSettings />;
}
