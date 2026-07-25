"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { getAdminAuth, isAdminAuthenticated, setAdminAuth } from "@/lib/auth";
import { getDefaultDashboardPath } from "@/lib/adminRoles";
import { ADMIN_NAME, SITE_NAME_SHORT } from "@/lib/siteMetadata";

const inputClass =
  "w-full rounded-md border border-dash-border bg-white px-3 py-2.5 text-sm text-dash-text outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

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
      router.replace(getDefaultDashboardPath(getAdminAuth()?.role));
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
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      setAdminAuth(data);
      router.replace(getDefaultDashboardPath(data.role));
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dash-bg">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-dash-bg px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-[-10%] h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute -bottom-24 left-[-10%] h-72 w-72 rounded-full bg-slate-300/25 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-indigo-600 uppercase">
            {SITE_NAME_SHORT}
          </p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-dash-text">{ADMIN_NAME}</h1>
          <p className="mt-1 text-sm text-dash-muted">Sign in to manage your store</p>
        </div>

        <form onSubmit={handleSubmit} className="dash-card p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="admin-username" className="mb-1.5 block text-sm font-medium text-dash-text">
                Username
              </label>
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                autoComplete="username"
                className={inputClass}
                placeholder="Admin username"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-dash-text">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                  className={`${inputClass} pr-10`}
                  placeholder="Password"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-dash-muted"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {error ? (
            <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
