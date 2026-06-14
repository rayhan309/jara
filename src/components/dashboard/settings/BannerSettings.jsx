"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { DEFAULT_SETTINGS } from "@/lib/siteSettings";
import { createHeroBanner } from "@/lib/heroBanners";
import { uploadHeroBanner } from "@/lib/api/settings";
import SettingsPageShell from "@/components/dashboard/settings/SettingsPageShell";
import { inputClass } from "@/components/dashboard/settings/settingsShared";
import { useSettingsEditor } from "@/components/dashboard/settings/useSettingsEditor";

export default function BannerSettings() {
  const { settings, isLoading, isError, error, refetch, save, isPending } = useSettingsEditor();
  const bannerInputRef = useRef(null);
  const [heroBanners, setHeroBanners] = useState(DEFAULT_SETTINGS.heroBanners);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setHeroBanners(settings.heroBanners || DEFAULT_SETTINGS.heroBanners);
  }, [settings]);

  async function handleBannerUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("শুধু image file দিন");
      return;
    }

    setIsUploadingBanner(true);

    try {
      const image = await uploadHeroBanner(file);
      setHeroBanners((current) => [...current, createHeroBanner(image)]);
      toast.success("ব্যানার যোগ হয়েছে — Save চাপুন");
    } catch (uploadError) {
      toast.error(uploadError.message || "ব্যানার আপলোড ব্যর্থ");
    } finally {
      setIsUploadingBanner(false);
      if (bannerInputRef.current) bannerInputRef.current.value = "";
    }
  }

  function handleBannerChange(id, field, value) {
    setHeroBanners((current) =>
      current.map((banner) => (banner.id === id ? { ...banner, [field]: value } : banner))
    );
  }

  function handleSubmit(event) {
    event.preventDefault();

    save({
      heroBanners: heroBanners.map((banner) => ({
        ...banner,
        alt: banner.alt.trim(),
        href: banner.href.trim() || "/products",
        enabled: Boolean(banner.enabled),
      })),
    });
  }

  return (
    <SettingsPageShell
      title="Hero Banners"
      description="হোম পেজের ব্যানার add/remove করুন। কোনো ব্যানার না থাকলে default image দেখাবে।"
      onSubmit={handleSubmit}
      isPending={isPending}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={refetch}
    >
      <section className="dash-card p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-dash-text">Home Hero Banners</h2>
            <p className="mt-1 text-sm text-dash-muted">Homepage slider images manage korun.</p>
          </div>
          <div>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              disabled={isUploadingBanner || isPending}
              className="inline-flex items-center gap-2 rounded-md border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-60"
            >
              {isUploadingBanner ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              Add Banner
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {heroBanners.length === 0 ? (
            <div className="rounded-md border border-dashed border-dash-border px-4 py-10 text-center text-sm text-dash-muted">
              এখনও কোনো ব্যানার নেই। Add Banner চাপুন অথবা storefront default ব্যানার দেখাবে।
            </div>
          ) : (
            heroBanners.map((banner, index) => (
              <div
                key={banner.id}
                className="grid gap-4 rounded-md border border-dash-border bg-slate-50/70 p-3 sm:grid-cols-[180px_1fr_auto] sm:items-start sm:p-4"
              >
                <div className="relative aspect-[1170/880] overflow-hidden rounded-lg border border-dash-border bg-white">
                  <Image
                    src={banner.image.url}
                    alt={banner.alt || `Banner ${index + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-dash-muted">Alt text</label>
                    <input
                      type="text"
                      value={banner.alt}
                      onChange={(event) => handleBannerChange(banner.id, "alt", event.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-dash-muted">Link URL</label>
                    <input
                      type="text"
                      value={banner.href}
                      onChange={(event) => handleBannerChange(banner.id, "href", event.target.value)}
                      placeholder="/products"
                      className={inputClass}
                    />
                  </div>
                  <label className="inline-flex items-center gap-2 rounded-md border border-dash-border bg-white px-3 py-2.5 text-xs font-semibold text-dash-text sm:col-span-2 sm:w-fit">
                    <input
                      type="checkbox"
                      checked={banner.enabled}
                      onChange={(event) =>
                        handleBannerChange(banner.id, "enabled", event.target.checked)
                      }
                      className="h-4 w-4 accent-indigo-600"
                    />
                    Show on homepage
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setHeroBanners((current) => current.filter((entry) => entry.id !== banner.id))
                  }
                  className="inline-flex h-10 items-center justify-center gap-1 self-start rounded-md border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-600 hover:bg-red-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </SettingsPageShell>
  );
}
