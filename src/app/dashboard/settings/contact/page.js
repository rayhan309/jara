import ContactSettings from "@/components/dashboard/settings/ContactSettings";
import { createAdminPageMetadata } from "@/lib/siteMetadata";

export const metadata = createAdminPageMetadata(
  "Contact Settings",
  "Update store contact phone, email, address and social links."
);

export default function ContactSettingsPage() {
  return <ContactSettings />;
}
