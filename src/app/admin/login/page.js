import AdminLoginForm from "@/components/auth/AdminLoginForm";
import { ADMIN_NAME, createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata({
  title: `Admin Login | ${ADMIN_NAME}`,
  absoluteTitle: true,
  description: "Nexa E-Commerce administrator login — secure access to the admin dashboard.",
  path: "/admin/login",
  noIndex: true,
});

export default function AdminLoginPage() {
  return (
    <div className="font-dashboard">
      <AdminLoginForm />
    </div>
  );
}
