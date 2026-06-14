"use client";

import { motion } from "motion/react";
import { Loader2, Save } from "lucide-react";

export default function SettingsPageShell({
  title,
  description,
  onSubmit,
  isPending,
  children,
  isLoading,
  isError,
  error,
  onRetry,
}) {
  if (isLoading) {
    return (
      <div className="dash-card flex min-h-[280px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="dash-card border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-600">{error?.message || "Failed to load settings."}</p>
        <button type="button" onClick={onRetry} className="mt-3 text-sm font-semibold text-indigo-600">
          Try again
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-indigo-600 uppercase">
            Settings
          </p>
          <h1 className="text-2xl font-bold text-dash-text">{title}</h1>
          {description ? <p className="mt-1 text-sm text-dash-muted">{description}</p> : null}
        </div>
        <motion.button
          type="submit"
          disabled={isPending}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center justify-center gap-2 self-start bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </motion.button>
      </motion.div>

      {children}
    </form>
  );
}
