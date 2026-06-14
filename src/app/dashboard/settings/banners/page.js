import BannerSettings from "@/components/dashboard/settings/BannerSettings";
import { createAdminPageMetadata } from "@/lib/siteMetadata";

export const metadata = createAdminPageMetadata(
  "Hero Banners",
  "Manage homepage hero banners and promotional slides."
);

export default function BannerSettingsPage() {
  return <BannerSettings />;
}
