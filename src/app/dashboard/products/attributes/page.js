import AttributesManager from "@/components/dashboard/AttributesManager";
import { createAdminPageMetadata } from "@/lib/siteMetadata";

export const metadata = createAdminPageMetadata(
  "Attributes",
  "Configure product variation types such as size, weight and color."
);

export default function ProductAttributesPage() {
  return <AttributesManager />;
}
