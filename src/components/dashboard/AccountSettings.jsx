"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";
import { updateAdminAuthProfile } from "@/lib/auth";
import { getRoleLabel } from "@/lib/adminRoles";
import { useAdminProfile, useUpdateAdminProfile } from "@/hooks/useAdminUsers";

const inputClass =
  "w-full border border-dash-border bg-white px-3 py-2.5 text-sm text-dash-text outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

export default function AccountSettings() {
  const { data: profile, isLoading, isError, error, refetch } = useAdminProfile();
  const { mutate: saveProfile, isPending } = useUpdateAdminProfile();

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name || profile.username || "");
  }, [profile]);

  function handleSubmit(event) {
    event.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    saveProfile(
      {
        name: name.trim(),
        currentPassword: newPassword ? currentPassword : undefined,
        newPassword: newPassword || undefined,
      },
      {
        onSuccess: (user) => {
          updateAdminAuthProfile(user);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          toast.success("Account updated successfully");
        },
        onError: (saveError) => toast.error(saveError.message || "Update failed"),
      }
    );
  }

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
        <p className="text-sm text-red-600">{error?.message || "Failed to load account."}</p>
        <button type="button" onClick={() => refetch()} className="mt-3 text-sm font-semibold text-indigo-600">
          Try again
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.16em] text-indigo-600 uppercase">Account</p>
        <h1 className="text-2xl font-bold text-dash-text">My Account</h1>
        <p className="mt-1 text-sm text-dash-muted">Update your name and password.</p>
      </div>

      <section className="dash-card space-y-4 p-5 sm:p-6">
        <div>
          <label className="mb-1 block text-xs font-semibold text-dash-muted">Username</label>
          <input type="text" value={profile?.username || ""} disabled className={`${inputClass} bg-slate-50`} />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-dash-muted">Role</label>
          <input
            type="text"
            value={getRoleLabel(profile?.role)}
            disabled
            className={`${inputClass} bg-slate-50`}
          />
        </div>

        <div>
          <label htmlFor="account-name" className="mb-1 block text-xs font-semibold text-dash-muted">
            Display Name
          </label>
          <input
            id="account-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClass}
          />
        </div>
      </section>

      <section className="dash-card space-y-4 p-5 sm:p-6">
        <h2 className="text-lg font-bold text-dash-text">Change Password</h2>

        <div>
          <label htmlFor="current-password" className="mb-1 block text-xs font-semibold text-dash-muted">
            Current Password
          </label>
          <div className="relative">
            <input
              id="current-password"
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className={`${inputClass} pr-10`}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((prev) => !prev)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-dash-muted"
            >
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="new-password" className="mb-1 block text-xs font-semibold text-dash-muted">
            New Password
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className={`${inputClass} pr-10`}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowNew((prev) => !prev)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-dash-muted"
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirm-password" className="mb-1 block text-xs font-semibold text-dash-muted">
            Confirm New Password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className={inputClass}
            autoComplete="new-password"
          />
        </div>
      </section>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-2 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Changes
      </button>
    </form>
  );
}
