import AccountSettings from "@/components/dashboard/AccountSettings";
import { createAdminPageMetadata } from "@/lib/siteMetadata";

export const metadata = createAdminPageMetadata(
  "My Account",
  "Update your admin profile, password and account preferences."
);

export default function AccountPage() {
  return <AccountSettings />;
}
