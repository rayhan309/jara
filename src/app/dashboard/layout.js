import AdminAuthGuard from "@/components/auth/AdminAuthGuard";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: "Dashboard | Nexa Admin",
  description: "Nexa E-Commerce admin dashboard",
};

export default function DashboardLayout({ children }) {
  return (
    <AdminAuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AdminAuthGuard>
  );
}
