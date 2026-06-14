"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { DEFAULT_SETTINGS, normalizeSteadfastBaseUrl } from "@/lib/siteSettings";
import SettingsPageShell from "@/components/dashboard/settings/SettingsPageShell";
import { inputClass } from "@/components/dashboard/settings/settingsShared";
import { useSettingsEditor } from "@/components/dashboard/settings/useSettingsEditor";

export default function SteadfastSettings() {
  const { settings, isLoading, isError, error, refetch, save, isPending } = useSettingsEditor();
  const [baseUrl, setBaseUrl] = useState(DEFAULT_SETTINGS.steadfastBaseUrl);
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [secretKeySet, setSecretKeySet] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setBaseUrl(settings.steadfastBaseUrl || DEFAULT_SETTINGS.steadfastBaseUrl);
    setApiKey(settings.steadfastApiKey || "");
    setSecretKey("");
    setSecretKeySet(Boolean(settings.steadfastSecretKeySet));
    setEnabled(Boolean(settings.steadfastEnabled));
  }, [settings]);

  function handleSubmit(event) {
    event.preventDefault();

    const cleanedBaseUrl = normalizeSteadfastBaseUrl(baseUrl);
    const cleanedApiKey = apiKey.trim();

    if (enabled && !cleanedApiKey) {
      toast.error("Steadfast API Key দিন");
      return;
    }

    if (enabled && !secretKey.trim() && !secretKeySet) {
      toast.error("Steadfast Secret Key দিন");
      return;
    }

    save({
      steadfastBaseUrl: cleanedBaseUrl,
      steadfastApiKey: cleanedApiKey,
      steadfastSecretKey: secretKey.trim(),
      steadfastEnabled: enabled,
    });
  }

  async function handleTestConnection() {
    const cleanedApiKey = apiKey.trim();

    if (!cleanedApiKey) {
      toast.error("API Key দিন");
      return;
    }

    if (!secretKey.trim() && !secretKeySet) {
      toast.error("Secret Key দিন অথবা আগে Save করুন");
      return;
    }

    setTesting(true);

    try {
      const response = await fetch("/api/admin/steadfast/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseUrl: normalizeSteadfastBaseUrl(baseUrl),
          apiKey: cleanedApiKey,
          secretKey: secretKey.trim(),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Connection test failed.");
      }

      toast.success(data.message || "Steadfast connection successful.");
    } catch (testError) {
      toast.error(testError.message || "Connection test failed.");
    } finally {
      setTesting(false);
    }
  }

  const isConfigured = Boolean(apiKey.trim() && (secretKeySet || secretKey.trim()));

  return (
    <SettingsPageShell
      title="Steadfast Courier"
      description="Steadfast API credentials দিন। Orders page থেকে Steadfast-এ পাঠানো যাবে।"
      onSubmit={handleSubmit}
      isPending={isPending}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={refetch}
    >
      <section className="dash-card p-5 sm:p-6">
        <div className="grid gap-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-dash-muted">Base URL</label>
            <input
              type="url"
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
              placeholder="https://portal.packzy.com/api/v1"
              className={inputClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-dash-muted">API Key</label>
              <input
                type="text"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="Your Steadfast API Key"
                className={`${inputClass} font-mono text-xs`}
                autoComplete="off"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-dash-muted">Secret Key</label>
              <input
                type="password"
                value={secretKey}
                onChange={(event) => setSecretKey(event.target.value)}
                placeholder={secretKeySet ? "Saved — change korle notun key din" : "Your Steadfast Secret Key"}
                className={`${inputClass} font-mono text-xs`}
                autoComplete="new-password"
              />
            </div>
          </div>

          <label className="inline-flex w-fit items-center gap-2 rounded-md border border-dash-border bg-white px-3 py-2.5 text-xs font-semibold text-dash-text">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(event) => setEnabled(event.target.checked)}
              className="h-4 w-4 accent-indigo-600"
            />
            Steadfast integration চালু করুন
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="rounded-md border border-dash-border bg-slate-50 px-4 py-3 text-xs text-dash-muted">
            {enabled && isConfigured ? (
              <span className="font-semibold text-emerald-700">Active — Steadfast API ব্যবহার হবে</span>
            ) : enabled ? (
              <span className="font-semibold text-amber-700">API Key ও Secret Key দিন, তারপর Save চাপুন</span>
            ) : (
              <span>Integration বন্ধ — order Steadfast-এ পাঠানো যাবে না</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing || isPending}
            className="inline-flex items-center gap-2 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-60"
          >
            {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Test Connection
          </button>
        </div>

        <p className="mt-4 text-xs text-dash-muted">
          Credentials পাবেন: Steadfast Dashboard → API Settings. `.env`-এ থাকলে সেটা fallback হিসেবে কাজ
          করবে যতক্ষণ না এখানে save করেন।
        </p>
      </section>
    </SettingsPageShell>
  );
}
