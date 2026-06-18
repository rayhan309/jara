import AdminAuthGuard from "@/components/auth/AdminAuthGuard";
import AdminRoleGuard from "@/components/auth/AdminRoleGuard";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardDataProvider from "@/components/providers/DashboardDataProvider";
import { getAdminSession } from "@/lib/adminAuthServer";
import { getDashboardPrefetch } from "@/lib/dashboardPrefetch";
import { getSiteSettings } from "@/lib/siteSettingsServer";
import { getFaviconUrl } from "@/lib/siteSettings";
import { adminRootMetadata } from "@/lib/siteMetadata";

export async function generateMetadata() {
  const settings = await getSiteSettings();
  const faviconUrl = getFaviconUrl(settings);

  if (!faviconUrl) {
    return adminRootMetadata;
  }

  return {
    ...adminRootMetadata,
    icons: {
      icon: [{ url: faviconUrl }],
    },
  };
}

export default async function DashboardLayout({ children }) {
  const session = await getAdminSession();
  const prefetch = await getDashboardPrefetch(session);
  const initialProfile = session
    ? {
        _id: session.userId,
        username: session.username,
        name: session.name,
        role: session.role,
      }
    : null;

  return (
    <div className="font-dashboard">
      <AdminAuthGuard initialProfile={initialProfile}>
        <AdminRoleGuard>
          <DashboardDataProvider prefetch={prefetch}>
            <DashboardShell>{children}</DashboardShell>
          </DashboardDataProvider>
        </AdminRoleGuard>
      </AdminAuthGuard>
    </div>
  );
}
