import UsersManager from "@/components/dashboard/UsersManager";
import { createAdminPageMetadata } from "@/lib/siteMetadata";

export const metadata = createAdminPageMetadata(
  "Users",
  "Manage admin users, roles and access permissions."
);

export default function UsersPage() {
  return <UsersManager />;
}
