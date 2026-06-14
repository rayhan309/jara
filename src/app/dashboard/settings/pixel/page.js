import PixelSettings from "@/components/dashboard/settings/PixelSettings";
import { createAdminPageMetadata } from "@/lib/siteMetadata";

export const metadata = createAdminPageMetadata(
  "Meta Pixel",
  "Configure Facebook Meta Pixel for conversion tracking and analytics."
);

export default function PixelSettingsPage() {
  return <PixelSettings />;
}
