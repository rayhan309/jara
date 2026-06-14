"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { DEFAULT_SETTINGS, normalizeMetaPixelId } from "@/lib/siteSettings";
import SettingsPageShell from "@/components/dashboard/settings/SettingsPageShell";
import { inputClass } from "@/components/dashboard/settings/settingsShared";
import { useSettingsEditor } from "@/components/dashboard/settings/useSettingsEditor";

export default function PixelSettings() {
  const { settings, isLoading, isError, error, refetch, save, isPending } = useSettingsEditor();
  const [metaPixelId, setMetaPixelId] = useState(DEFAULT_SETTINGS.metaPixelId);
  const [metaPixelEnabled, setMetaPixelEnabled] = useState(DEFAULT_SETTINGS.metaPixelEnabled);

  useEffect(() => {
    if (!settings) return;
    setMetaPixelId(settings.metaPixelId || "");
    setMetaPixelEnabled(Boolean(settings.metaPixelEnabled));
  }, [settings]);

  function handleSubmit(event) {
    event.preventDefault();

    const cleanedPixelId = normalizeMetaPixelId(metaPixelId);
    if (metaPixelEnabled && cleanedPixelId.length < 10) {
      toast.error("Meta Pixel ID সঠিক দিন (কমপক্ষে ১০ ডিজিট)");
      return;
    }

    save({
      metaPixelId: cleanedPixelId,
      metaPixelEnabled,
    });
  }

  return (
    <SettingsPageShell
      title="Meta Pixel"
      description="Meta Events Manager থেকে Pixel ID দিন। Storefront-এ PageView, AddToCart, Purchase track হবে।"
      onSubmit={handleSubmit}
      isPending={isPending}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={refetch}
    >
      <section className="dash-card p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label className="mb-1 block text-xs font-semibold text-dash-muted">Pixel ID</label>
            <input
              type="text"
              inputMode="numeric"
              value={metaPixelId}
              onChange={(event) => setMetaPixelId(event.target.value)}
              placeholder="1234567890123456"
              className={`${inputClass} font-mono`}
            />
            <p className="mt-2 text-xs text-dash-muted">
              Events Manager → Data Sources → আপনার Pixel → Settings → Pixel ID
            </p>
          </div>

          <label className="inline-flex h-fit items-center gap-2 rounded-md border border-dash-border bg-white px-3 py-2.5 text-xs font-semibold text-dash-text">
            <input
              type="checkbox"
              checked={metaPixelEnabled}
              onChange={(event) => setMetaPixelEnabled(event.target.checked)}
              className="h-4 w-4 accent-indigo-600"
            />
            Pixel চালু করুন
          </label>
        </div>

        <div className="mt-4 rounded-md border border-dash-border bg-slate-50 px-4 py-3 text-xs text-dash-muted">
          {metaPixelEnabled && normalizeMetaPixelId(metaPixelId).length >= 10 ? (
            <span className="font-semibold text-emerald-700">
              Active — storefront-এ Meta Pixel লোড হবে
            </span>
          ) : metaPixelEnabled ? (
            <span className="font-semibold text-amber-700">Pixel ID দিন এবং Save চাপুন</span>
          ) : (
            <span>Pixel বন্ধ আছে — tracking হবে না</span>
          )}
        </div>
      </section>
    </SettingsPageShell>
  );
}
