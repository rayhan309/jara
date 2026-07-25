import AdminLoginForm from "@/components/auth/AdminLoginForm";
import DashboardMuiThemeProvider from "@/components/providers/DashboardMuiThemeProvider";
import { ADMIN_NAME, createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata({
  title: `Admin Login | ${ADMIN_NAME}`,
  absoluteTitle: true,
  description: "Raisa's Glam Nest administrator login — secure access to the admin dashboard.",
  path: "/admin/login",
  noIndex: true,
});

export default function AdminLoginPage() {
  return (
    <DashboardMuiThemeProvider>
      <AdminLoginForm />
    </DashboardMuiThemeProvider>
  );
}
