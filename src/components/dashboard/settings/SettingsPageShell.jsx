"use client";

import { Loader2, Save } from "lucide-react";
import DashPageHeader from "@/components/dashboard/DashPageHeader";

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
      <DashPageHeader
        eyebrow="Settings"
        title={title}
        description={description}
        action={
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </button>
        }
      />

      {children}
    </form>
  );
}
