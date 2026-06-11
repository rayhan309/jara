"use client";

import { useCallback, useState } from "react";
import { Menu } from "lucide-react";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { motion } from "motion/react";
import { getAdminAuth } from "@/lib/auth";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardBackground from "@/components/dashboard/DashboardBackground";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(long = true) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: long ? "long" : undefined,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

export default function DashboardShell({ children }) {
  const auth = getAdminAuth();
  const username = auth?.username || "Admin";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);

  return (
    <div className="flex h-screen overflow-hidden bg-dash-bg">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardBackground />

        <header className="relative z-10 shrink-0 border-b border-dash-border bg-white/90 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 px-3 py-2.5 sm:px-5 sm:py-3 lg:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <motion.button
                type="button"
                aria-label="Open menu"
                whileTap={{ scale: 0.95 }}
                onClick={openSidebar}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-dash-border bg-white text-dash-muted transition-colors hover:border-indigo-300 hover:text-indigo-600 lg:hidden"
              >
                <Menu className="h-4 w-4" strokeWidth={1.75} />
              </motion.button>

              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="min-w-0"
              >
                <p className="truncate text-[10px] font-medium text-dash-muted sm:text-[11px]">
                  <span className="sm:hidden">{formatDate(false)}</span>
                  <span className="hidden sm:inline">{formatDate(true)}</span>
                </p>
                <h1 className="mt-0.5 truncate text-sm font-bold tracking-tight text-dash-text sm:text-base lg:text-lg">
                  <span className="md:hidden">Hi, {username}</span>
                  <span className="hidden md:inline">
                    {getGreeting()}, {username}
                  </span>
                </h1>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.08 }}
              className="shrink-0"
            >
              <button
                type="button"
                aria-label={`${username} profile`}
                title={username}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-dash-border bg-white text-dash-muted transition-colors hover:border-indigo-300 hover:text-indigo-600 sm:h-9 sm:w-9"
              >
                <HiOutlineUserCircle className="h-5 w-5 sm:h-[22px] sm:w-[22px]" />
              </button>
            </motion.div>
          </div>
        </header>

        <main className="relative z-10 min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-5 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
