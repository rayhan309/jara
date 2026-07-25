"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { fetchAdminProfile } from "@/lib/api/adminUsers";
import { getAdminAuth, setAdminAuth, clearAdminAuth, isAdminAuthenticated } from "@/lib/auth";
import { getDefaultDashboardPath } from "@/lib/adminRoles";

export default function AdminAuthGuard({ children, initialProfile = null }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function verifySession() {
      if (!isAdminAuthenticated()) {
        router.replace("/admin/login");
        return;
      }

      if (initialProfile) {
        setAdminAuth(initialProfile);
        setReady(true);
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
  }, [router, initialProfile]);

  if (!ready) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <CircularProgress size={28} />
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={700}
            sx={{ letterSpacing: "0.2em", textTransform: "uppercase" }}
          >
            Verifying session
          </Typography>
        </Box>
      </Box>
    );
  }

  return children;
}

export function getPostLoginPath() {
  const auth = getAdminAuth();
  return getDefaultDashboardPath(auth?.role);
}
