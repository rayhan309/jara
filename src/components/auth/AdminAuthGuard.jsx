"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/auth";

export default function AdminAuthGuard({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.replace("/admin/login");
      return;
    }

    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dash-bg">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-5"
        >
          <div className="rounded-md relative flex h-14 w-14 items-center justify-center border border-indigo-200 bg-white">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          </div>
          <p className="text-xs font-semibold tracking-[0.2em] text-dash-muted uppercase">
            Verifying admin session
          </p>
        </motion.div>
      </div>
    );
  }

  return children;
}
