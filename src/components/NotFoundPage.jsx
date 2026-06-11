"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, Home, Package, Search } from "lucide-react";
import StoreShell from "@/components/layout/StoreShell";

const floatingItems = [
  { label: "404", top: "12%", left: "8%", delay: 0 },
  { label: "?", top: "22%", right: "10%", delay: 0.2 },
  { label: "0", bottom: "28%", left: "12%", delay: 0.4 },
  { label: "4", bottom: "18%", right: "14%", delay: 0.6 },
];

export default function NotFoundPage() {
  return (
    <StoreShell>
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(to right, #e4e4e7 1px, transparent 1px),
              linear-gradient(to bottom, #e4e4e7 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {floatingItems.map((item) => (
          <motion.span
            key={item.label + item.delay}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0.06, 0.12, 0.06],
              y: [0, -14, 0],
              rotate: [0, 6, 0],
            }}
            transition={{
              duration: 5 + item.delay * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: item.delay,
            }}
            className="pointer-events-none absolute text-6xl font-black text-indigo-200 sm:text-8xl"
            style={{
              top: item.top,
              left: item.left,
              right: item.right,
              bottom: item.bottom,
            }}
          >
            {item.label}
          </motion.span>
        ))}

        <div className="store-container relative z-10 flex flex-col items-center justify-center py-16 text-center lg:py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative mb-8"
          >
            <motion.div
              animate={{ rotate: [0, -4, 4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-md flex h-24 w-24 items-center justify-center border-2 border-dashed border-indigo-200 bg-indigo-50 sm:h-28 sm:w-28"
            >
              <Package className="h-10 w-10 text-indigo-500 sm:h-12 sm:w-12" />
            </motion.div>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 260 }}
              className="rounded-md absolute -top-2 -right-2 flex h-10 w-10 items-center justify-center bg-indigo-600 text-sm font-bold text-white shadow-lg"
            >
              ?
            </motion.span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-xs font-semibold tracking-[0.12em] text-indigo-600"
          >
            পেজ পাওয়া যায়নি
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-3 text-5xl font-black tracking-tight text-zinc-900 sm:text-7xl"
          >
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="text-indigo-600"
            >
              4
            </motion.span>
            <motion.span
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block"
            >
              0
            </motion.span>
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
              className="text-indigo-600"
            >
              4
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-4 max-w-md text-sm leading-relaxed text-zinc-500 sm:text-base"
          >
            আপনি যে পেজটি খুঁজছেন সেটি নেই বা সরিয়ে নেওয়া হয়েছে। চলুন আপনাকে
            সঠিক পথে ফিরিয়ে নিয়ে যাই।
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4"
          >
            <Link href="/">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex w-full items-center justify-center gap-2 bg-indigo-600 px-6 py-3.5 text-sm font-semibold tracking-wide text-white uppercase transition-colors hover:bg-indigo-700 sm:w-auto"
              >
                <Home className="h-4 w-4" />
                হোমে ফিরুন
              </motion.span>
            </Link>
            <Link href="/orders-traking">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-md inline-flex w-full items-center justify-center gap-2 border border-zinc-200 bg-white px-6 py-3.5 text-sm font-semibold tracking-wide text-zinc-700 uppercase transition-colors hover:border-indigo-300 hover:text-indigo-600 sm:w-auto"
              >
                <Search className="h-4 w-4" />
                অর্ডার ট্র্যাক
              </motion.span>
            </Link>
          </motion.div>

          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={() => window.history.back()}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 transition-colors hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
            পেছনে যান
          </motion.button>
        </div>
      </div>
    </StoreShell>
  );
}
