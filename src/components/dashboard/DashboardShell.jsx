"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, Settings, UserCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getAdminAuth } from "@/lib/auth";
import { getRoleLabel, hasPermission, PERMISSIONS } from "@/lib/adminRoles";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardBackground from "@/components/dashboard/DashboardBackground";

const HEADER_HEIGHT = "h-[70px]";

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
  })
    .format(new Date())
    .toUpperCase();
}

function getInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "A";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function UserMenu({ username, roleLabel, role, onClose }) {
  const canAccessSettings = hasPermission(role, PERMISSIONS.SETTINGS);

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
      className="absolute top-[calc(100%+6px)] right-0 z-50 w-full min-w-[200px] overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_16px_40px_-12px_rgba(15,23,42,0.18)]"
    >
      <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white px-4 py-3">
        <p className="truncate text-sm font-semibold leading-tight text-dash-text">{username}</p>
        <p className="mt-1 truncate text-[11px] font-medium leading-tight text-indigo-600">
          {roleLabel}
        </p>
      </div>

      <div className="p-1.5">
        <Link
          href="/dashboard/account"
          onClick={onClose}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium leading-none text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
        >
          <UserCircle className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.75} />
          Profile
        </Link>

        {canAccessSettings ? (
          <Link
            href="/dashboard/settings/general"
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium leading-none text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
          >
            <Settings className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.75} />
            Settings
          </Link>
        ) : null}
      </div>
    </motion.div>
  );
}

export default function DashboardShell({ children }) {
  const auth = getAdminAuth();
  const username = auth?.name || auth?.username || "Admin";
  const roleLabel = getRoleLabel(auth?.role);
  const initials = getInitials(username);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-dash-bg">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardBackground />

        <header
          className={`relative z-20 shrink-0 border-b border-slate-200/80 bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-xl ${HEADER_HEIGHT}`}
        >
          <div className="flex h-full items-center justify-between gap-4 px-3 sm:px-5 lg:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
              <motion.button
                type="button"
                aria-label="Open menu"
                whileTap={{ scale: 0.95 }}
                onClick={openSidebar}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-indigo-200 hover:text-indigo-600 lg:hidden"
              >
                <Menu className="h-4 w-4" strokeWidth={1.75} />
              </motion.button>

              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex min-w-0 flex-col justify-center gap-1"
              >
                <span className="inline-flex w-fit items-center rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-slate-500 sm:text-[11px]">
                  <span className="sm:hidden">{formatDate(false)}</span>
                  <span className="hidden sm:inline">{formatDate(true)}</span>
                </span>
                <h1 className="truncate text-sm font-bold leading-tight tracking-tight text-slate-900 sm:text-[15px] lg:text-base">
                  <span className="md:hidden">Hi, {username}</span>
                  <span className="hidden md:inline">
                    {getGreeting()}, {username}
                  </span>
                </h1>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.06 }}
              className="relative shrink-0 self-center"
              ref={menuRef}
            >
              <button
                type="button"
                aria-label="Account menu"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                onClick={() => setMenuOpen((prev) => !prev)}
                className={`flex h-10 items-center gap-2.5 rounded-xl border bg-white px-2 shadow-sm transition-all sm:h-11 sm:min-w-[180px] sm:px-2.5 ${
                  menuOpen
                    ? "border-indigo-200 ring-2 ring-indigo-100"
                    : "border-slate-200/90 hover:border-indigo-200 hover:shadow-md"
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 text-xs font-bold text-white shadow-sm">
                  {initials}
                </span>

                <span className="hidden min-w-0 flex-1 flex-col justify-center text-left leading-none sm:flex">
                  <span className="truncate text-sm font-semibold text-slate-800">{username}</span>
                  <span className="mt-1 truncate text-[11px] font-medium text-slate-500">
                    {roleLabel}
                  </span>
                </span>

                <ChevronDown
                  className={`hidden h-4 w-4 shrink-0 text-slate-400 transition-transform sm:ml-auto sm:block ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                  strokeWidth={2}
                />
              </button>

              <AnimatePresence>
                {menuOpen ? (
                  <UserMenu
                    username={username}
                    roleLabel={roleLabel}
                    role={auth?.role}
                    onClose={closeMenu}
                  />
                ) : null}
              </AnimatePresence>
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
