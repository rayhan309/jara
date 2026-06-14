import GeneralSettings from "@/components/dashboard/settings/GeneralSettings";
import { createAdminPageMetadata } from "@/lib/siteMetadata";

export const metadata = createAdminPageMetadata(
  "General Settings",
  "Configure store theme, branding and general site preferences."
);

export default function GeneralSettingsPage() {
  return <GeneralSettings />;
}
