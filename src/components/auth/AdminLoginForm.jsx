"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { RiStore2Fill } from "react-icons/ri";
import { TbShieldLock } from "react-icons/tb";
import { HiOutlineShoppingBag, HiOutlineUsers } from "react-icons/hi2";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { isAdminAuthenticated, setAdminAuth } from "@/lib/auth";

const activityData = [
  { day: "M", value: 24 },
  { day: "T", value: 38 },
  { day: "W", value: 32 },
  { day: "T", value: 52 },
  { day: "F", value: 45 },
  { day: "S", value: 68 },
  { day: "S", value: 58 },
];

const highlights = [
  { label: "Orders Today", value: "128", icon: HiOutlineShoppingBag },
  { label: "Active Users", value: "896", icon: HiOutlineUsers },
  { label: "Uptime", value: "99.9%", icon: ShieldCheck },
];

function BrandPanel() {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden border-r border-zinc-100 bg-white p-8 sm:p-10 lg:p-12">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e4e4e7 1px, transparent 1px),
            linear-gradient(to bottom, #e4e4e7 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px",
        }}
      />
      <motion.div
        animate={{ opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute -top-16 -left-16 h-64 w-64 rounded-md bg-indigo-200 blur-3xl"
      />
      <motion.div
        animate={{ opacity: [0.03, 0.07, 0.03] }}
        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        className="absolute right-0 bottom-0 h-72 w-72 rounded-md bg-violet-200 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center gap-3"
      >
        <div className="rounded-md flex h-12 w-12 items-center justify-center bg-indigo-600 shadow-md shadow-indigo-200">
          <RiStore2Fill className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-lg font-bold text-zinc-900">Nexa Commerce</p>
          <p className="text-xs tracking-[0.18em] text-zinc-400 uppercase">
            Admin Command Center
          </p>
        </div>
      </motion.div>

      <div className="relative z-10 my-8 lg:my-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="rounded-md mb-6 inline-flex items-center gap-2 border border-indigo-100 bg-indigo-50 px-3 py-1.5"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          <span className="text-[11px] font-semibold tracking-widest text-indigo-700 uppercase">
            Enterprise Admin Portal
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-lg text-3xl leading-tight font-bold tracking-tight text-zinc-900 sm:text-4xl"
        >
          Control your store.
          <span className="mt-1 block text-indigo-600">Scale with confidence.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="mt-4 max-w-md text-sm leading-relaxed text-zinc-500"
        >
          Secure access to orders, inventory, analytics, and customer insights —
          built for store administrators only.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36 }}
          className="rounded-md mt-8 border border-zinc-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
              Store Activity
            </p>
            <span className="text-xs font-bold text-emerald-600">+24.8%</span>
          </div>
          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="loginChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e4e4e7",
                    borderRadius: 6,
                    fontSize: 12,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  }}
                  labelStyle={{ color: "#71717a" }}
                  itemStyle={{ color: "#4f46e5" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#loginChartGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="relative z-10 grid grid-cols-3 gap-2 sm:gap-3"
      >
        {highlights.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.08 }}
              className="rounded-md border border-zinc-200 bg-white p-3 shadow-sm sm:p-4"
            >
              <Icon className="h-4 w-4 text-indigo-600" />
              <p className="mt-2 text-lg font-bold text-zinc-900 sm:text-xl">{item.value}</p>
              <p className="mt-0.5 text-[9px] leading-tight tracking-wider text-zinc-400 uppercase sm:text-[10px]">
                {item.label}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

export default function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    if (isAdminAuthenticated()) {
      router.replace("/dashboard");
      return;
    }

    setCheckingSession(false);
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Admin login failed.");
        return;
      }

      setAdminAuth(data.username);
      router.replace("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-5"
        >
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-xs font-semibold tracking-[0.25em] text-zinc-400 uppercase">
            Verifying session
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <BrandPanel />
      </div>

      <div className="flex min-h-screen flex-col bg-white">
        <div className="flex flex-1 flex-col justify-center px-4 py-10 sm:px-8 lg:px-12 xl:px-20">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center gap-3 lg:hidden"
          >
            <div className="rounded-md flex h-11 w-11 items-center justify-center bg-indigo-600">
              <RiStore2Fill className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-zinc-900">Nexa Commerce</p>
              <p className="text-[10px] tracking-widest text-zinc-400 uppercase">Admin Portal</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-full max-w-[420px] lg:mx-0 lg:max-w-md"
          >
            <div className="mb-8">
              <div className="rounded-md mb-4 inline-flex items-center gap-2 border border-indigo-100 bg-indigo-50 px-3 py-1">
                <TbShieldLock className="h-4 w-4 text-indigo-600" />
                <span className="text-[11px] font-semibold tracking-widest text-indigo-700 uppercase">
                  Secure Login
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                Welcome back, Admin
              </h1>
              <p className="mt-2 text-sm text-zinc-500">
                Sign in with your administrator credentials to access the dashboard.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-md border border-zinc-200 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-8"
            >
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="admin-username"
                    className="mb-2 block text-xs font-semibold tracking-widest text-zinc-500 uppercase"
                  >
                    Admin Username
                  </label>
                  <div className="relative">
                    <User className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      id="admin-username"
                      type="text"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      required
                      autoComplete="username"
                      className="rounded-md w-full border border-zinc-200 bg-white py-3 pr-4 pl-10 text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      placeholder="Enter admin username"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="admin-password"
                    className="mb-2 block text-xs font-semibold tracking-widest text-zinc-500 uppercase"
                  >
                    Admin Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      autoComplete="current-password"
                      className="rounded-md w-full border border-zinc-200 bg-white py-3 pr-11 pl-10 text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      placeholder="Enter admin password"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 transition-colors hover:text-indigo-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {error ? (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 overflow-hidden rounded-md border-l-4 border-red-500 bg-red-50 px-3 py-2.5 text-sm text-red-700"
                  >
                    {error}
                  </motion.p>
                ) : null}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="group mt-6 flex w-full items-center justify-center gap-2 bg-indigo-600 py-3.5 text-sm font-semibold tracking-wide text-white uppercase transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying credentials...
                  </>
                ) : (
                  <>
                    Access Dashboard
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </motion.button>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-4 text-center"
            >
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Encrypted session
              </div>
              <div className="hidden h-3 w-px bg-zinc-200 sm:block" />
              <p className="text-xs text-zinc-400">Customer accounts cannot sign in here</p>
            </motion.div>
          </motion.div>

          <div className="mx-auto mt-10 w-full max-w-[420px] lg:hidden">
            <div className="grid grid-cols-3 gap-2">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-md border border-zinc-200 bg-white p-3 text-center shadow-sm"
                  >
                    <Icon className="mx-auto h-4 w-4 text-indigo-600" />
                    <p className="mt-1.5 text-sm font-bold text-zinc-900">{item.value}</p>
                    <p className="text-[8px] tracking-wider text-zinc-400 uppercase">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
