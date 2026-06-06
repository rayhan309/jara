"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import { RiStore2Fill } from "react-icons/ri";
import { clearAdminAuth, getAdminAuth } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = getAdminAuth();

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event) {
      if (event.key === "Escape") onClose();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  function handleLogout() {
    clearAdminAuth();
    router.replace("/admin/login");
  }

  return (
    <>
      <AnimatePresence>
        {isOpen ? (
          <motion.button
            type="button"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          />
        ) : null}
      </AnimatePresence>

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[260px] max-w-[85vw] shrink-0 flex-col overflow-y-auto bg-dash-sidebar text-white transition-transform duration-300 ease-out lg:relative lg:sticky lg:top-0 lg:z-30 lg:max-w-none lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="absolute inset-y-0 right-0 w-px bg-dash-sidebar-border" />

        <div className="relative border-b border-dash-sidebar-border border-gray-700 px-5 py-5 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex min-w-0 items-center gap-3"
            >
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600">
                <RiStore2Fill className="h-5 w-5 text-white" />
                <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 border-2 border-dash-sidebar bg-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-bold tracking-tight">Nexa Commerce</p>
                <p className="text-[11px] font-medium tracking-[0.12em] text-indigo-300/80 uppercase">
                  Admin Console
                </p>
              </div>
            </motion.div>

            <button
              type="button"
              aria-label="Close sidebar"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center border border-slate-700 text-slate-300 transition-colors hover:border-slate-500 hover:bg-white/10 hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="px-3 pt-5 sm:px-4 sm:pt-6">
          <p className="mb-3 px-3 text-[10px] font-semibold tracking-[0.2em] text-slate-500 uppercase">
            Main Menu
          </p>
          <nav className="space-y-1">
            {navItems.map((item, index) => {
              const active = pathname === item.href;
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`group relative flex items-center gap-3 px-3 py-3 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-white/10 text-white"
                        : "text-slate-400 hover:bg-dash-sidebar-hover hover:text-white"
                    }`}
                  >
                    {active ? (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute inset-y-2 left-0 w-1 bg-gradient-to-b from-indigo-400 to-violet-400"
                      />
                    ) : null}
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center border transition-colors ${
                        active
                          ? "border-indigo-400/40 bg-indigo-500/20 text-indigo-200"
                          : "border-slate-700 bg-slate-800/50 text-slate-400 group-hover:border-slate-600 group-hover:text-white"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    {item.label}
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-dash-sidebar-border p-3 sm:p-4">
          <div className="mb-3 flex items-center gap-3 bg-white/5 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-gradient-to-br from-slate-600 to-slate-700 text-sm font-bold uppercase">
              {(auth?.username || "A").charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {auth?.username || "Admin"}
              </p>
              <p className="text-[11px] text-slate-400">Store Administrator</p>
            </div>
          </div>
          <motion.button
            type="button"
            onClick={handleLogout}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="flex w-full items-center justify-center gap-2 border border-slate-700 py-2.5 text-xs font-semibold tracking-wide text-slate-300 uppercase transition-colors hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </motion.button>
        </div>
      </aside>
    </>
  );
}
