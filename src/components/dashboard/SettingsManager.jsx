"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { ImagePlus, Loader2, Plus, Save, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  DEFAULT_SETTINGS,
  deriveThemeColors,
  normalizeHexColor,
  normalizeMetaPixelId,
  SOCIAL_PLATFORMS,
  applyThemeToDocument,
} from "@/lib/siteSettings";
import { createHeroBanner } from "@/lib/heroBanners";
import { uploadHeroBanner } from "@/lib/api/settings";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/useSiteSettings";

const COLOR_PRESETS = [
  { label: "Indigo", value: "#4f46e5" },
  { label: "Emerald", value: "#059669" },
  { label: "Orange", value: "#ea580c" },
  { label: "Rose", value: "#e11d48" },
  { label: "Sky", value: "#0284c7" },
  { label: "Violet", value: "#7c3aed" },
];

const inputClass =
  "w-full border border-dash-border bg-white px-3 py-2.5 text-sm text-dash-text outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

function createSocialLink(platform = "facebook") {
  const meta = SOCIAL_PLATFORMS.find((item) => item.id === platform) || SOCIAL_PLATFORMS[0];

  return {
    id: `social-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    platform: meta.id,
    label: meta.label,
    url: "",
    enabled: true,
  };
}

export default function SettingsManager() {
  const { data: settings, isLoading, isError, error, refetch } = useSiteSettings();
  const { mutate: saveSettings, isPending } = useUpdateSiteSettings();

  const bannerInputRef = useRef(null);
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_SETTINGS.primaryColor);
  const [heroBanners, setHeroBanners] = useState(DEFAULT_SETTINGS.heroBanners);
  const [socialLinks, setSocialLinks] = useState(DEFAULT_SETTINGS.socialLinks);
  const [metaPixelId, setMetaPixelId] = useState(DEFAULT_SETTINGS.metaPixelId);
  const [metaPixelEnabled, setMetaPixelEnabled] = useState(DEFAULT_SETTINGS.metaPixelEnabled);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setPrimaryColor(settings.primaryColor);
    setHeroBanners(settings.heroBanners || DEFAULT_SETTINGS.heroBanners);
    setSocialLinks(settings.socialLinks || DEFAULT_SETTINGS.socialLinks);
    setMetaPixelId(settings.metaPixelId || "");
    setMetaPixelEnabled(Boolean(settings.metaPixelEnabled));
  }, [settings]);

  const previewTheme = useMemo(
    () => deriveThemeColors(normalizeHexColor(primaryColor)),
    [primaryColor]
  );

  function handleAddSocialLink() {
    setSocialLinks((current) => [...current, createSocialLink()]);
  }

  function handleRemoveSocialLink(id) {
    setSocialLinks((current) => current.filter((link) => link.id !== id));
  }

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
      toast.success("ব্যানার যোগ হয়েছে — Save Settings চাপুন");
    } catch (uploadError) {
      toast.error(uploadError.message || "ব্যানার আপলোড ব্যর্থ");
    } finally {
      setIsUploadingBanner(false);
      if (bannerInputRef.current) bannerInputRef.current.value = "";
    }
  }

  function handleRemoveBanner(id) {
    setHeroBanners((current) => current.filter((banner) => banner.id !== id));
  }

  function handleBannerChange(id, field, value) {
    setHeroBanners((current) =>
      current.map((banner) => (banner.id === id ? { ...banner, [field]: value } : banner))
    );
  }

  function handleSocialChange(id, field, value) {
    setSocialLinks((current) =>
      current.map((link) => {
        if (link.id !== id) return link;

        if (field === "platform") {
          const meta = SOCIAL_PLATFORMS.find((item) => item.id === value);
          return {
            ...link,
            platform: value,
            label: meta?.label || link.label,
          };
        }

        return { ...link, [field]: value };
      })
    );
  }

  function handleSubmit(event) {
    event.preventDefault();

    const invalidLink = socialLinks.find((link) => link.enabled && !link.url.trim());
    if (invalidLink) {
      toast.error(`"${invalidLink.label}" link er URL দিন`);
      return;
    }

    const cleanedPixelId = normalizeMetaPixelId(metaPixelId);
    if (metaPixelEnabled && cleanedPixelId.length < 10) {
      toast.error("Meta Pixel ID সঠিক দিন (কমপক্ষে ১০ ডিজিট)");
      return;
    }

    saveSettings(
      {
        primaryColor: normalizeHexColor(primaryColor),
        metaPixelId: cleanedPixelId,
        metaPixelEnabled,
        heroBanners: heroBanners.map((banner) => ({
          ...banner,
          alt: banner.alt.trim(),
          href: banner.href.trim() || "/products",
          enabled: Boolean(banner.enabled),
        })),
        socialLinks: socialLinks.map((link) => ({
          ...link,
          url: link.url.trim(),
          enabled: Boolean(link.enabled && link.url.trim()),
        })),
      },
      {
        onSuccess: (savedSettings) => {
          applyThemeToDocument(savedSettings);
          toast.success("Settings saved successfully");
        },
        onError: (saveError) => toast.error(saveError.message || "Save failed"),
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
        <p className="text-sm text-red-600">{error?.message || "Failed to load settings."}</p>
        <button type="button" onClick={() => refetch()} className="mt-3 text-sm font-semibold text-indigo-600">
          Try again
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-indigo-600 uppercase">
            Configuration
          </p>
          <h1 className="text-2xl font-bold text-dash-text">Store Settings</h1>
          <p className="mt-1 text-sm text-dash-muted">
            Storefront color, Meta Pixel, hero banners ar footer social links manage korun.
          </p>
        </div>
        <motion.button
          type="submit"
          disabled={isPending}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center justify-center gap-2 self-start bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Settings
        </motion.button>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="dash-card p-5 sm:p-6">
          <h2 className="text-lg font-bold text-dash-text">Brand Color</h2>
          <p className="mt-1 text-sm text-dash-muted">
            Buttons, navbar, links ar accent color change hobe.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <input
              type="color"
              value={primaryColor}
              onChange={(event) => setPrimaryColor(event.target.value)}
              className="h-12 w-12 cursor-pointer rounded-md border border-dash-border bg-white p-1"
              aria-label="Primary color picker"
            />
            <input
              type="text"
              value={primaryColor}
              onChange={(event) => setPrimaryColor(event.target.value)}
              placeholder="#4f46e5"
              className={`${inputClass} max-w-[160px] font-mono uppercase`}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setPrimaryColor(preset.value)}
                className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  primaryColor.toLowerCase() === preset.value
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                    : "border-dash-border bg-white text-dash-muted hover:border-indigo-200"
                }`}
              >
                <span
                  className="h-3.5 w-3.5 rounded-full border border-black/10"
                  style={{ backgroundColor: preset.value }}
                />
                {preset.label}
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-md border border-dash-border bg-slate-50 p-4">
            <p className="text-xs font-semibold tracking-wide text-dash-muted uppercase">Preview</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className="rounded-md px-3 py-2 text-xs font-semibold text-white"
                style={{ backgroundColor: previewTheme.primaryColor }}
              >
                Primary Button
              </span>
              <span
                className="rounded-md px-3 py-2 text-xs font-semibold text-white"
                style={{ backgroundColor: previewTheme.primaryColorHover }}
              >
                Hover
              </span>
              <span
                className="rounded-md border px-3 py-2 text-xs font-semibold"
                style={{
                  color: previewTheme.primaryColor,
                  borderColor: previewTheme.primaryColorBorder,
                  backgroundColor: previewTheme.primaryColorSoft,
                }}
              >
                Soft Badge
              </span>
            </div>
          </div>
        </section>

        <section className="dash-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-dash-text">Social Links</h2>
              <p className="mt-1 text-sm text-dash-muted">
                Footer e show hobe. URL na thakle disable thakbe.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddSocialLink}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Link
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {socialLinks.length === 0 ? (
              <div className="rounded-md border border-dashed border-dash-border px-4 py-8 text-center text-sm text-dash-muted">
                No social links yet. Add one above.
              </div>
            ) : (
              socialLinks.map((link) => (
                <div
                  key={link.id}
                  className="rounded-md border border-dash-border bg-slate-50/70 p-3 sm:p-4"
                >
                  <div className="grid gap-3 md:grid-cols-[140px_1fr_auto] md:items-end">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-dash-muted">
                        Platform
                      </label>
                      <select
                        value={link.platform}
                        onChange={(event) =>
                          handleSocialChange(link.id, "platform", event.target.value)
                        }
                        className={inputClass}
                      >
                        {SOCIAL_PLATFORMS.map((platform) => (
                          <option key={platform.id} value={platform.id}>
                            {platform.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-dash-muted">
                        URL
                      </label>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(event) =>
                          handleSocialChange(link.id, "url", event.target.value)
                        }
                        placeholder="https://facebook.com/yourpage"
                        className={inputClass}
                      />
                    </div>

                    <div className="flex items-center gap-2 sm:flex-col sm:items-stretch">
                      <label className="inline-flex items-center gap-2 rounded-md border border-dash-border bg-white px-3 py-2.5 text-xs font-semibold text-dash-text">
                        <input
                          type="checkbox"
                          checked={link.enabled}
                          onChange={(event) =>
                            handleSocialChange(link.id, "enabled", event.target.checked)
                          }
                          className="h-4 w-4 accent-indigo-600"
                        />
                        Show
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveSocialLink(link.id)}
                        className="inline-flex items-center justify-center gap-1 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="dash-card p-5 sm:p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-dash-text">Meta Pixel (Facebook)</h2>
          <p className="mt-1 text-sm text-dash-muted">
            Meta Events Manager থেকে Pixel ID দিন। Storefront-এ PageView, AddToCart, Purchase track হবে।
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
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
              <span className="font-semibold text-amber-700">
                Pixel ID দিন এবং Save Settings চাপুন
              </span>
            ) : (
              <span>Pixel বন্ধ আছে — tracking হবে না</span>
            )}
          </div>
        </section>
      </div>

      <section className="dash-card p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-dash-text">Home Hero Banners</h2>
            <p className="mt-1 text-sm text-dash-muted">
              হোম পেজের ব্যানার add/remove করুন। কোনো ব্যানার না থাকলে default image দেখাবে।
            </p>
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
                  onClick={() => handleRemoveBanner(banner.id)}
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
    </form>
  );
}
