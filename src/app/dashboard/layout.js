import AdminAuthGuard from "@/components/auth/AdminAuthGuard";
import AdminRoleGuard from "@/components/auth/AdminRoleGuard";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: "Dashboard | Nexa Admin",
  description: "Nexa E-Commerce admin dashboard",
};

export default function DashboardLayout({ children }) {
  return (
    <div className="font-dashboard">
      <AdminAuthGuard>
        <AdminRoleGuard>
          <DashboardShell>{children}</DashboardShell>
        </AdminRoleGuard>
      </AdminAuthGuard>
    </div>
  );
}
