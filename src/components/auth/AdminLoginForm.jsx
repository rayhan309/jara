"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { RiStore2Fill } from "react-icons/ri";
import { HiOutlineChartBarSquare } from "react-icons/hi2";
import { isAdminAuthenticated, setAdminAuth } from "@/lib/auth";

export default function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
      <div className="flex min-h-screen items-center justify-center bg-dash-sidebar">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
            Checking session
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 overflow-hidden bg-dash-sidebar lg:flex lg:flex-col lg:justify-between">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #334155 1px, transparent 1px),
              linear-gradient(to bottom, #334155 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-1/4 -left-20 h-64 w-64 bg-indigo-600/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-80 w-80 bg-violet-600/15 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 p-12"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600">
              <RiStore2Fill className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Nexa Commerce</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative z-10 px-12 pb-16"
        >
          <div className="mb-6 inline-flex items-center gap-2 border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5">
            <ShieldCheck className="h-4 w-4 text-indigo-300" />
            <span className="text-xs font-semibold tracking-wide text-indigo-200 uppercase">
              Secure Admin Access
            </span>
          </div>
          <h2 className="max-w-md text-4xl leading-tight font-bold tracking-tight text-white">
            Manage your store with precision
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            Real-time analytics, order management, and inventory control — all in one
            professional admin console.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              { label: "Orders", icon: HiOutlineChartBarSquare },
              { label: "Products", icon: RiStore2Fill },
              { label: "Analytics", icon: HiOutlineChartBarSquare },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="border border-slate-700 bg-white/5 p-4 text-center"
                >
                  <Icon className="mx-auto h-5 w-5 text-indigo-300" />
                  <p className="mt-2 text-[10px] tracking-widest text-slate-500 uppercase">
                    {item.label}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-dash-bg px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600">
                <RiStore2Fill className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-dash-text">Nexa Admin</span>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-xs font-semibold tracking-[0.2em] text-indigo-600 uppercase">
              Admin Console
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-dash-text">
              Sign in to dashboard
            </h1>
            <p className="mt-2 text-sm text-dash-muted">
              Authorized store administrators only
            </p>
          </div>

          <form onSubmit={handleSubmit} className="dash-card p-8">
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="admin-username"
                  className="mb-2 block text-xs font-semibold tracking-widest text-dash-muted uppercase"
                >
                  Admin Username
                </label>
                <input
                  id="admin-username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                  autoComplete="username"
                  className="w-full border border-dash-border bg-white px-4 py-3 text-dash-text outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Enter admin username"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-2 block text-xs font-semibold tracking-widest text-dash-muted uppercase"
                >
                  Admin Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full border border-dash-border bg-white px-4 py-3 text-dash-text outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Enter admin password"
                />
              </div>
            </div>

            {error ? (
              <motion.p
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="mt-4 border-l-4 border-red-500 bg-red-50 px-3 py-2.5 text-sm text-red-700"
              >
                {error}
              </motion.p>
            ) : null}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="mt-6 flex w-full items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 text-sm font-semibold tracking-wide text-white uppercase transition-all hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying credentials...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Access Dashboard
                </>
              )}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-xs text-dash-muted">
            Protected area — customer accounts cannot sign in here.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
