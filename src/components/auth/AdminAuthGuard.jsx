"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { fetchAdminProfile } from "@/lib/api/adminUsers";
import { getAdminAuth, setAdminAuth, clearAdminAuth, isAdminAuthenticated } from "@/lib/auth";
import { getDefaultDashboardPath } from "@/lib/adminRoles";

export default function AdminAuthGuard({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function verifySession() {
      if (!isAdminAuthenticated()) {
        router.replace("/admin/login");
        return;
      }

      try {
        const user = await fetchAdminProfile();
        setAdminAuth(user);
        setReady(true);
      } catch {
        clearAdminAuth();
        router.replace("/admin/login");
      }
    }

    verifySession();
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dash-bg">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-5"
        >
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          <p className="text-xs font-semibold tracking-[0.2em] text-dash-muted uppercase">
            Verifying session
          </p>
        </motion.div>
      </div>
    );
  }

  return children;
}

export function getPostLoginPath() {
  const auth = getAdminAuth();
  return getDefaultDashboardPath(auth?.role);
}
