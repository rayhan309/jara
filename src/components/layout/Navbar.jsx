"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Loader2,
  Menu,
  Package,
  Search,
  ShoppingCart,
  Smartphone,
  Truck,
  X,
} from "lucide-react";
import { RiStore2Fill } from "react-icons/ri";
import { setSelectedCategoryId } from "@/lib/categoryFilter";
import { useCart } from "@/hooks/useCart";
import { useCategories } from "@/hooks/useCategories";
import { isValidBdPhone, normalizePhone } from "@/lib/orderValidation";
import CartSidebar from "@/components/cart/CartSidebar";

const CONTACT_PHONE = "+8801815131040";

const navLinks = [
  { href: "/", label: "হোম" },
  { href: "/products", label: "পণ্য", match: (path) => path === "/products" || path.startsWith("/products/") },
  { href: "/categories", label: "ক্যাটাগরি", match: (path) => path === "/categories" || path.startsWith("/categories/") },
  { href: "/orders-traking", label: "অর্ডার ট্র্যাক" },
];

function HeaderSearch({ className = "" }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const normalized = normalizePhone(phone);

    if (normalized && isValidBdPhone(normalized)) {
      router.push(`/orders-traking?phone=${encodeURIComponent(normalized)}`);
      return;
    }

    router.push("/orders-traking");
  }

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div className="flex overflow-hidden rounded-xl border-2 border-indigo-100 bg-zinc-50 shadow-sm transition-colors focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100">
        <span className="flex shrink-0 items-center border-r border-indigo-100 bg-white px-3 text-xs font-semibold text-zinc-500">
          +88
        </span>
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(event) => setPhone(normalizePhone(event.target.value))}
          placeholder="অর্ডার ট্র্যাক — ফোন নম্বর"
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
        />
        <button
          type="submit"
          aria-label="অর্ডার খুঁজুন"
          className="flex shrink-0 items-center justify-center bg-indigo-600 px-4 text-white transition-colors hover:bg-indigo-700"
        >
          <Search className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>
    </form>
  );
}

const navLinkActiveClass = "bg-white/20 text-white shadow-sm";
const navLinkInactiveClass = "text-indigo-50 hover:bg-white/10";

export default function Navbar() {
  return (
    <Suspense fallback={<NavbarFallback />}>
      <NavbarContent />
    </Suspense>
  );
}

function NavbarFallback() {
  return (
    <header className="shadow-sm">
      <div className="bg-indigo-700 px-4 py-2 text-center text-[11px] font-medium text-white sm:text-xs">
        বিশ্বস্ত অনলাইন শপিং — দ্রুত ডেলিভারি ও সহজ অর্ডার ট্র্যাকিং
      </div>
      <div className="border-b border-zinc-100 bg-white">
        <div className="container mx-auto px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <div className="h-10 animate-pulse rounded-md bg-zinc-100 sm:h-11" />
          <div className="mt-3 h-10 animate-pulse rounded-xl bg-zinc-100 lg:hidden" />
        </div>
      </div>
      <div className="border-b border-indigo-800/80 bg-indigo-700">
        <div className="container mx-auto h-11 px-4 sm:px-6 lg:px-8" />
      </div>
    </header>
  );
}

function NavbarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategorySlug = searchParams.get("category");
  const { count: cartCount } = useCart();
  const { data: categories = [], isLoading } = useCategories();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    setCartOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="shadow-sm">
        <div className="bg-indigo-700 px-4 py-2 text-center text-[11px] font-medium text-white sm:text-xs">
          বিশ্বস্ত অনলাইন শপিং — দ্রুত ডেলিভারি ও সহজ অর্ডার ট্র্যাকিং
        </div>

        <div className="border-b border-zinc-100 bg-white">
          <div className="container mx-auto px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
            <div className="flex items-center justify-between gap-3 lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-8">
              <Link href="/" className="group flex shrink-0 items-center gap-2.5 sm:gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-600 shadow-md shadow-indigo-200 sm:h-11 sm:w-11">
                  <RiStore2Fill className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                </div>
                <div>
                  <p className="text-base font-bold tracking-tight text-zinc-900 transition-colors group-hover:text-indigo-600 sm:text-xl">
                    Nexa Commerce
                  </p>
                  <p className="hidden text-[11px] text-zinc-400 sm:block">প্রিমিয়াম অনলাইন শপিং</p>
                </div>
              </Link>

              <div className="hidden min-w-0 lg:block">
                <HeaderSearch className="mx-auto max-w-xl" />
              </div>

              <div className="hidden shrink-0 items-center gap-3 lg:flex">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-indigo-600 text-indigo-600">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">যোগাযোগ করুন</p>
                  <p className="text-sm font-bold text-zinc-900">{CONTACT_PHONE}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 lg:hidden">
                <button
                  type="button"
                  aria-label="কার্ট খুলুন"
                  onClick={() => setCartOpen(true)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 text-zinc-700"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 ? (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-md bg-indigo-600 px-1 text-[10px] font-bold text-white">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  ) : null}
                </button>
                <button
                  type="button"
                  aria-label={menuOpen ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 text-zinc-700"
                >
                  {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="mt-3 lg:hidden">
              <HeaderSearch />
            </div>
          </div>
        </div>

        <nav
          aria-label="ক্যাটাগরি মেনু"
          className="border-b border-indigo-800/80 bg-indigo-700 text-white"
        >
          <div className="container mx-auto flex items-center gap-2 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <Link
                href="/"
                className={`shrink-0 rounded-md px-3 py-1.5 text-[13px] font-semibold whitespace-nowrap transition-colors sm:text-sm ${
                  pathname === "/"
                    ? navLinkActiveClass
                    : navLinkInactiveClass
                }`}
              >
                হোম
              </Link>

              {isLoading ? (
                <span className="inline-flex shrink-0 items-center gap-2 px-3 py-1.5 text-xs text-indigo-200">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  লোড...
                </span>
              ) : (
                categories.map((category) => {
                  const active =
                    pathname === "/products" && activeCategorySlug === category.slug;
                  return (
                    <Link
                      key={category._id}
                      href={`/products?category=${category.slug}`}
                      onClick={() => setSelectedCategoryId(category._id)}
                      className={`shrink-0 rounded-md px-3 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors sm:text-sm ${
                        active ? navLinkActiveClass : navLinkInactiveClass
                      }`}
                    >
                      {category.name}
                    </Link>
                  );
                })
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2 border-l border-indigo-600 py-2 pl-2 sm:pl-3">
              <button
                type="button"
                aria-label="কার্ট খুলুন"
                onClick={() => setCartOpen(true)}
                className="relative hidden h-9 w-9 items-center justify-center rounded-md text-white transition-colors hover:bg-indigo-600 lg:flex"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 ? (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-0.5 text-[9px] font-bold text-indigo-700">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                ) : null}
              </button>
              <Link
                href="/orders-traking"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-emerald-400 sm:px-4 sm:text-[13px]"
              >
                <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">অর্ডার ট্র্যাক</span>
                <span className="sm:hidden">ট্র্যাক</span>
              </Link>
            </div>
          </div>
        </nav>
      </header>

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
              className="fixed inset-0 z-40 bg-zinc-900/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 right-0 z-50 flex w-[min(100%,320px)] flex-col border-l border-zinc-200 bg-white shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                <p className="text-sm font-bold text-zinc-900">মেনু</p>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="flex flex-col gap-1 overflow-y-auto p-4">
                {navLinks.map((link) => {
                  const active = link.match ? link.match(pathname) : pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block rounded-md px-4 py-3 text-sm font-semibold transition-colors ${
                        active
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-zinc-700 hover:bg-zinc-50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <Link
                  href="/categories"
                  className="mt-2 flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600"
                >
                  সব ক্যাটাগরি
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </nav>
              <div className="mt-auto space-y-2 border-t border-zinc-100 p-4">
                <div className="flex items-center gap-3 rounded-md bg-zinc-50 p-3">
                  <Smartphone className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-xs text-zinc-500">যোগাযোগ</p>
                    <p className="text-sm font-bold text-zinc-900">{CONTACT_PHONE}</p>
                  </div>
                </div>
                <Link href="/orders-traking">
                  <span className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 py-3 text-sm font-semibold text-white">
                    <Package className="h-4 w-4" />
                    অর্ডার ট্র্যাক করুন
                  </span>
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
