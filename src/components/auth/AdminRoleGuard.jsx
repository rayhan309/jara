"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAdminAuth } from "@/lib/auth";
import { canAccessDashboardPath, getDefaultDashboardPath } from "@/lib/adminRoles";

export default function AdminRoleGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const auth = getAdminAuth();

  useEffect(() => {
    if (!auth?.role) return;

    if (!canAccessDashboardPath(auth.role, pathname)) {
      router.replace(getDefaultDashboardPath(auth.role));
    }
  }, [auth?.role, pathname, router]);

  return children;
}
