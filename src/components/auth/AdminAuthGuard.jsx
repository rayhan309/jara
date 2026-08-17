"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAdminProfile } from "@/lib/api/adminUsers";
import { getAdminAuth, setAdminAuth, clearAdminAuth, isAdminAuthenticated } from "@/lib/auth";
import { getDefaultDashboardPath } from "@/lib/adminRoles";

const AdminAuthContext = createContext(null);

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

export default function AdminAuthGuard({ children, initialProfile = null }) {
  const router = useRouter();
  // Server already verified the cookie when initialProfile is present — start ready
  // so SSR and client hydrate the same tree (avoids MUI/Emotion loading-state mismatch).
  const [ready, setReady] = useState(() => Boolean(initialProfile));
  const [profile, setProfile] = useState(initialProfile);

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      if (initialProfile) {
        setAdminAuth(initialProfile);
        if (!cancelled) {
          setProfile(initialProfile);
          setReady(true);
        }
        return;
      }

      if (!isAdminAuthenticated()) {
        router.replace("/admin/login");
        return;
      }

      try {
        const user = await fetchAdminProfile();
        if (cancelled) return;
        setAdminAuth(user);
        setProfile(user);
        setReady(true);
      } catch {
        clearAdminAuth();
        router.replace("/admin/login");
      }
    }

    verifySession();
    return () => {
      cancelled = true;
    };
  }, [router, initialProfile]);

  if (!ready) {
    // Plain HTML avoids Emotion style-insertion vs div hydration mismatches
    // next to DashboardMuiThemeProvider's CssBaseline.
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#64748b",
          }}
        >
          Verifying session
        </p>
      </div>
    );
  }

  return <AdminAuthContext.Provider value={profile}>{children}</AdminAuthContext.Provider>;
}

export function getPostLoginPath() {
  const auth = getAdminAuth();
  return getDefaultDashboardPath(auth?.role);
}
