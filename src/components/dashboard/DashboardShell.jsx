"use client";

import { useCallback, useState } from "react";
import { Bell, Menu, Radio, Search } from "lucide-react";
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
          <div className="flex items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-5 sm:py-4 lg:px-8 lg:py-5">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <motion.button
                type="button"
                aria-label="Open menu"
                whileTap={{ scale: 0.95 }}
                onClick={openSidebar}
                className="rounded-md flex h-9 w-9 shrink-0 items-center justify-center border border-dash-border bg-white text-dash-muted transition-colors hover:border-indigo-300 hover:text-indigo-600 sm:h-10 sm:w-10 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </motion.button>

              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="min-w-0"
              >
                <p className="truncate text-[11px] font-medium text-dash-muted sm:text-xs">
                  <span className="sm:hidden">{formatDate(false)}</span>
                  <span className="hidden sm:inline">{formatDate(true)}</span>
                </p>
                <h1 className="mt-0.5 truncate text-base font-bold tracking-tight text-dash-text sm:text-lg lg:text-xl">
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
              className="flex shrink-0 items-center gap-1.5 sm:gap-2"
            >
              <div className="relative hidden lg:block">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-dash-muted" />
                <input
                  type="search"
                  placeholder="Search orders, products..."
                  className="rounded-md w-64 border border-dash-border bg-white py-2 pr-4 pl-9 text-sm text-dash-text outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <motion.button
                type="button"
                aria-label="Notifications"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-md relative flex h-9 w-9 shrink-0 items-center justify-center border border-dash-border bg-white text-dash-muted transition-colors hover:border-indigo-300 hover:text-indigo-600 sm:h-10 sm:w-10"
              >
                <Bell className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-md bg-indigo-500 sm:top-2 sm:right-2" />
              </motion.button>

              <div
                className="rounded-md flex h-9 shrink-0 items-center justify-center gap-1.5 border border-emerald-200 bg-emerald-50 px-2 sm:h-10 sm:gap-2 sm:px-3"
                title="Live"
              >
                <Radio className="h-3.5 w-3.5 text-emerald-600" />
                <span className="hidden text-xs font-semibold tracking-wide text-emerald-700 uppercase min-[420px]:inline">
                  Live
                </span>
              </div>
            </motion.div>
          </div>

          <div className="border-t border-dash-border px-3 pb-3 sm:px-5 lg:hidden">
            <div className="relative mt-3">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-dash-muted" />
              <input
                type="search"
                placeholder="Search orders, products..."
                className="rounded-md w-full border border-dash-border bg-white py-2.5 pr-4 pl-9 text-sm text-dash-text outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
        </header>

        <main className="relative z-10 min-h-0 flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
