"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  ChevronDown,
  Layers,
  Loader2,
  Menu,
  Package,
  ShoppingBag,
  ShoppingCart,
  X,
} from "lucide-react";
import { RiStore2Fill } from "react-icons/ri";
import { setSelectedCategoryId } from "@/lib/categoryFilter";
import { useCart } from "@/hooks/useCart";
import { useCategories } from "@/hooks/useCategories";
import CartSidebar from "@/components/cart/CartSidebar";

const MEGA_MENU_LIMIT = 12;

const navLinks = [
  { href: "/", label: "হোম" },
  {
    href: "/products",
    label: "পণ্য",
    match: (path) => path === "/products" || path.startsWith("/products/"),
  },
  { href: "/orders-traking", label: "অর্ডার ট্র্যাক" },
];

function CategoryNavItem({ category, onNavigate }) {
  return (
    <Link
      href={`/products?category=${category.slug}`}
      onClick={() => {
        setSelectedCategoryId(category._id);
        onNavigate?.();
      }}
      className="group flex items-center gap-3 px-2 py-2.5 transition-colors hover:bg-indigo-50/60"
    >
      <div className="rounded-md relative h-11 w-11 shrink-0 overflow-hidden border border-zinc-100 bg-zinc-50">
        {category.image?.url ? (
          <Image
            src={category.image.url}
            alt={category.name}
            fill
            unoptimized
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-300">
            <Layers className="h-4 w-4" />
          </div>
        )}
      </div>
      <span className="line-clamp-2 text-sm font-medium leading-snug text-zinc-700 group-hover:text-indigo-700">
        {category.name}
      </span>
    </Link>
  );
}

function CategoriesMegaMenu({ open, onClose, onOpen, categories, isLoading }) {
  const preview = categories.slice(0, MEGA_MENU_LIMIT);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          onMouseEnter={onOpen}
          onMouseLeave={onClose}
          className="absolute inset-x-0 top-full z-50 hidden md:block"
        >
          <div className="h-2" />
          <div className="border-t border-zinc-200 bg-white shadow-lg">
            <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="flex min-h-[160px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              </div>
            ) : preview.length === 0 ? (
              <div className="flex min-h-[120px] flex-col items-center justify-center gap-3 text-center">
                <p className="text-sm text-zinc-500">এখনও কোনো ক্যাটাগরি নেই।</p>
                <Link
                  href="/categories"
                  onClick={onClose}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  ক্যাটাগরি পেজ দেখুন
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 lg:grid-cols-4 xl:grid-cols-6">
                  {preview.map((category) => (
                    <CategoryNavItem key={category._id} category={category} onNavigate={onClose} />
                  ))}
                </div>
                <div className="mt-5 border-t border-zinc-100 pt-4">
                  <Link
                    href="/categories"
                    onClick={onClose}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
                  >
                    সব ক্যাটাগরি
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </>
            )}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function MobileCategoriesSection({ categories, isLoading, onNavigate }) {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  const active =
    pathname === "/categories" || pathname.startsWith("/categories/");

  return (
    <div className="rounded-md border border-zinc-100">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className={`flex w-full items-center justify-between px-4 py-3 text-sm font-semibold transition-colors ${
          active
            ? "bg-indigo-50 text-indigo-700"
            : "text-zinc-700 hover:bg-zinc-50"
        }`}
      >
        <span>ক্যাটাগরি</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {expanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-zinc-100"
          >
            <div className="space-y-1 p-2">
              {isLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                </div>
              ) : categories.length === 0 ? (
                <Link
                  href="/categories"
                  onClick={onNavigate}
                  className="block px-3 py-2 text-sm text-zinc-500"
                >
                  ক্যাটাগরি দেখুন
                </Link>
              ) : (
                <>
                  {categories.map((category) => (
                    <CategoryNavItem
                      key={category._id}
                      category={category}
                      onNavigate={onNavigate}
                    />
                  ))}
                  <Link
                    href="/categories"
                    onClick={onNavigate}
                    className="mt-1 flex items-center gap-2 px-3 py-2 text-sm font-semibold text-indigo-600"
                  >
                    সব ক্যাটাগরি
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { count: cartCount } = useCart();
  const { data: categories = [], isLoading } = useCategories();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const categoriesRef = useRef(null);

  const categoriesActive =
    pathname === "/categories" || pathname.startsWith("/categories/");

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setCategoriesOpen(false);
    setCartOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setCategoriesOpen(false);
      }
    }

    if (categoriesOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [categoriesOpen]);

  function closeCategoriesMenu() {
    setCategoriesOpen(false);
  }

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={`relative sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled || categoriesOpen
            ? "border-zinc-200/80 bg-white/90 shadow-sm backdrop-blur-md"
            : "border-transparent bg-white"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-md flex h-10 w-10 items-center justify-center bg-indigo-600 shadow-md shadow-indigo-200"
            >
              <RiStore2Fill className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <p className="text-base font-bold tracking-tight text-zinc-900 transition-colors group-hover:text-indigo-600 sm:text-lg">
                Nexa Commerce
              </p>
              <p className="hidden text-[11px] text-zinc-400 sm:block">
                প্রিমিয়াম অনলাইন শপিং
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.slice(0, 1).map((link) => {
              const active = link.match
                ? link.match(pathname)
                : pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                    active ? "text-indigo-600" : "text-zinc-600 hover:text-indigo-600"
                  }`}
                >
                  {link.label}
                  {active ? (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 bg-indigo-600"
                    />
                  ) : null}
                </Link>
              );
            })}

            <div ref={categoriesRef} className="relative">
              <button
                type="button"
                onMouseEnter={() => setCategoriesOpen(true)}
                onClick={() => setCategoriesOpen((prev) => !prev)}
                className={`relative inline-flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors ${
                  categoriesActive || categoriesOpen
                    ? "text-indigo-600"
                    : "text-zinc-600 hover:text-indigo-600"
                }`}
              >
                ক্যাটাগরি
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${categoriesOpen ? "rotate-180" : ""}`}
                />
                {categoriesActive ? (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-3 -bottom-0.5 h-0.5 bg-indigo-600"
                  />
                ) : null}
              </button>
            </div>

            {navLinks.slice(1).map((link) => {
              const active = link.match
                ? link.match(pathname)
                : pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                    active ? "text-indigo-600" : "text-zinc-600 hover:text-indigo-600"
                  }`}
                >
                  {link.label}
                  {active ? (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 bg-indigo-600"
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              aria-label="কার্ট খুলুন"
              onClick={() => setCartOpen(true)}
              className="relative"
            >
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-md inline-flex h-10 w-10 items-center justify-center border border-zinc-200 text-zinc-700 transition-colors hover:border-indigo-300 hover:text-indigo-600"
              >
                <ShoppingCart className="h-4 w-4" />
              </motion.span>
              {cartCount > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-md bg-indigo-600 px-1 text-[10px] font-bold text-white">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              ) : null}
            </button>
            <Link href="/orders-traking">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-md inline-flex items-center gap-2 border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-indigo-300 hover:text-indigo-600"
              >
                <Package className="h-3.5 w-3.5" />
                ট্র্যাক করুন
              </motion.span>
            </Link>
            <Link href="/products">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                কেনাকাটা করুন
              </motion.span>
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              aria-label="কার্ট খুলুন"
              onClick={() => setCartOpen(true)}
              className="rounded-md relative flex h-10 w-10 items-center justify-center border border-zinc-200 text-zinc-700"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-md bg-indigo-600 px-1 text-[10px] font-bold text-white">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              ) : null}
            </button>
            <motion.button
              type="button"
              aria-label={menuOpen ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMenuOpen((prev) => !prev)}
              className="rounded-md flex h-10 w-10 items-center justify-center border border-zinc-200 text-zinc-700"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.button>
          </div>
        </div>

        <CategoriesMegaMenu
          open={categoriesOpen}
          onOpen={() => setCategoriesOpen(true)}
          onClose={closeCategoriesMenu}
          categories={categories}
          isLoading={isLoading}
        />
      </motion.header>

      <AnimatePresence>
        {menuOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="মেনু বন্ধ করুন"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-zinc-900/40 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 right-0 z-50 flex w-[min(100%,320px)] flex-col border-l border-zinc-200 bg-white shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                <p className="text-sm font-bold text-zinc-900">মেনু</p>
                <button
                  type="button"
                  aria-label="মেনু বন্ধ করুন"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md flex h-9 w-9 items-center justify-center border border-zinc-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="flex flex-col gap-1 overflow-y-auto p-4">
                {navLinks.map((link, index) => {
                  const active = link.match
                    ? link.match(pathname)
                    : pathname === link.href;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.06 }}
                    >
                      <Link
                        href={link.href}
                        className={`block rounded-md border px-4 py-3 text-sm font-semibold transition-colors ${
                          active
                            ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                            : "border-transparent text-zinc-700 hover:border-zinc-200 hover:bg-zinc-50"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.06 }}
                >
                  <MobileCategoriesSection
                    categories={categories}
                    isLoading={isLoading}
                    onNavigate={() => setMenuOpen(false)}
                  />
                </motion.div>
              </nav>
              <div className="mt-auto border-t border-zinc-100 p-4">
                <Link href="/orders-traking">
                  <motion.span
                    whileTap={{ scale: 0.98 }}
                    className="flex w-full items-center justify-center gap-2 bg-indigo-600 py-3 text-sm font-semibold text-white"
                  >
                    <Package className="h-4 w-4" />
                    অর্ডার ট্র্যাক করুন
                  </motion.span>
                </Link>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
