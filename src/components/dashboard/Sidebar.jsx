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

const iconProps = { className: "h-4 w-4 shrink-0", strokeWidth: 1.75 };

function isCatalogPath(pathname) {
  return (
    pathname.startsWith("/dashboard/products") ||
    pathname.startsWith("/dashboard/categories")
  );
}

function NavLink({ href, active, icon: Icon, label, onClose }) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className={`group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors ${
        active
          ? "bg-white/[0.08] text-white"
          : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
      }`}
    >
      {active ? (
        <motion.span
          layoutId="sidebar-active"
          className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-indigo-400"
        />
      ) : null}
      <Icon
        {...iconProps}
        className={`${iconProps.className} ${
          active ? "text-indigo-300" : "text-slate-500 group-hover:text-slate-300"
        }`}
      />
      {label}
    </Link>
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
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[232px] max-w-[82vw] shrink-0 flex-col overflow-y-auto bg-dash-sidebar text-white transition-transform duration-300 ease-out lg:relative lg:sticky lg:top-0 lg:z-30 lg:max-w-none lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="absolute inset-y-0 right-0 w-px bg-dash-sidebar-border" />

        <div className="relative border-b border-dash-sidebar-border border-gray-700 px-4 py-3.5">
          <div className="flex items-center justify-between gap-2">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex min-w-0 items-center gap-2.5"
            >
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
                <RiStore2Fill className="h-3.5 w-3.5 text-white" />
                <span className="absolute -right-0.5 -bottom-0.5 h-1.5 w-1.5 rounded-full border border-dash-sidebar bg-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold tracking-tight">Nexa</p>
                <p className="text-[10px] font-medium tracking-[0.1em] text-slate-500 uppercase">
                  Admin Console
                </p>
              </div>
            </motion.div>

            <button
              type="button"
              aria-label="Close sidebar"
              onClick={onClose}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-slate-700/80 text-slate-400 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="px-2.5 pt-4">
          <p className="mb-2 px-2.5 text-[10px] font-medium tracking-[0.14em] text-slate-600 uppercase">
            Main Menu
          </p>
          <nav className="space-y-0.5">
            {navItems.map((item, index) => {
              if (item.children) {
                const groupActive = isCatalogPath(pathname);
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <button
                      type="button"
                      onClick={() => setProductsOpen((open) => !open)}
                      className={`group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors ${
                        groupActive
                          ? "bg-white/[0.08] text-white"
                          : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                      }`}
                    >
                      {groupActive ? (
                        <motion.span
                          layoutId="sidebar-active"
                          className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-indigo-400"
                        />
                      ) : null}
                      <Icon
                        {...iconProps}
                        className={`${iconProps.className} ${
                          groupActive
                            ? "text-indigo-300"
                            : "text-slate-500 group-hover:text-slate-300"
                        }`}
                      />
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform duration-200 ${
                          productsOpen ? "rotate-180" : ""
                        }`}
                        strokeWidth={2}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {productsOpen ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-0.5 ml-4 space-y-0.5 border-l border-slate-700/60 pl-2">
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
                                  className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] transition-colors ${
                                    childActive
                                      ? "bg-indigo-500/15 font-medium text-indigo-200"
                                      : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
                                  }`}
                                >
                                  <ChildIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
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

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <NavLink
                    href={item.href}
                    active={active}
                    icon={item.icon}
                    label={item.label}
                    onClose={onClose}
                  />
                </motion.div>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-dash-sidebar-border border-gray-700 p-2.5">
          <div className="mb-2 flex items-center gap-2.5 rounded-lg bg-white/[0.04] px-2.5 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-700/80 text-[11px] font-semibold uppercase text-slate-200">
              {(auth?.username || "A").charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-slate-200">
                {auth?.username || "Admin"}
              </p>
              <p className="truncate text-[10px] text-slate-500">Store Administrator</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700/80 py-1.5 text-[11px] font-medium text-slate-400 transition-colors hover:border-red-500/40 hover:bg-red-500/[0.08] hover:text-red-300"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
