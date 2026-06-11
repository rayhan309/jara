"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronDown,
  Layers,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import { RiStore2Fill } from "react-icons/ri";
import { clearAdminAuth, getAdminAuth } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  {
    label: "Products",
    icon: Package,
    children: [
      { href: "/dashboard/products", label: "Products", icon: Package },
      { href: "/dashboard/categories", label: "Categories", icon: Layers },
    ],
  },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function isCatalogPath(pathname) {
  return (
    pathname.startsWith("/dashboard/products") ||
    pathname.startsWith("/dashboard/categories")
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = getAdminAuth();
  const [productsOpen, setProductsOpen] = useState(() => isCatalogPath(pathname));

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  useEffect(() => {
    if (isCatalogPath(pathname)) {
      setProductsOpen(true);
    }
  }, [pathname]);

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

        <div className="rounded-md relative border-b border-dash-sidebar-border border-gray-700 px-5 py-5 sm:px-6">
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
              className="rounded-md flex h-9 w-9 shrink-0 items-center justify-center border border-slate-700 text-slate-300 transition-colors hover:border-slate-500 hover:bg-white/10 hover:text-white lg:hidden"
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
              if (item.children) {
                const groupActive = isCatalogPath(pathname);
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <button
                      type="button"
                      onClick={() => setProductsOpen((open) => !open)}
                      className={`group relative flex w-full items-center gap-3 px-3 py-3 text-sm font-medium transition-all duration-200 ${
                        groupActive
                          ? "bg-white/10 text-white"
                          : "text-slate-400 hover:bg-dash-sidebar-hover hover:text-white"
                      }`}
                    >
                      {groupActive ? (
                        <motion.span
                          layoutId="sidebar-active"
                          className="absolute inset-y-2 left-0 w-1 bg-gradient-to-b from-indigo-400 to-violet-400"
                        />
                      ) : null}
                      <span
                        className={`rounded-md flex h-9 w-9 shrink-0 items-center justify-center border transition-colors ${
                          groupActive
                            ? "border-indigo-400/40 bg-indigo-500/20 text-indigo-200"
                            : "border-slate-700 bg-slate-800/50 text-slate-400 group-hover:border-slate-600 group-hover:text-white"
                        }`}
                      >
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                          productsOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {productsOpen ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-1 space-y-1 border-l border-slate-700/80 pl-3 ml-6">
                            {item.children.map((child) => {
                              const childActive =
                                pathname === child.href ||
                                pathname.startsWith(`${child.href}/`);
                              const ChildIcon = child.icon;

                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  onClick={onClose}
                                  className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors ${
                                    childActive
                                      ? "bg-indigo-500/15 font-semibold text-indigo-100"
                                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                                  }`}
                                >
                                  <ChildIcon className="h-4 w-4 shrink-0 opacity-80" />
                                  {child.label}
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </motion.div>
                );
              }

              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
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
                      className={`rounded-md flex h-9 w-9 shrink-0 items-center justify-center border transition-colors ${
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

        <div className="rounded-md mt-auto border-t border-dash-sidebar-border border-gray-700 p-3 sm:p-4">
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
            className="rounded-md flex w-full items-center justify-center gap-2 border border-slate-700 py-2.5 text-xs font-semibold tracking-wide text-slate-300 uppercase transition-colors hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </motion.button>
        </div>
      </aside>
    </>
  );
}
