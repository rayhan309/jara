"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  DEFAULT_SETTINGS,
  deriveThemeColors,
  getFaviconUrl,
  getShopLogoUrl,
  normalizeHexColor,
  SOCIAL_PLATFORMS,
} from "@/lib/siteSettings";
import { uploadBrandAsset } from "@/lib/api/settings";
import SettingsPageShell from "@/components/dashboard/settings/SettingsPageShell";
import { inputClass } from "@/components/dashboard/settings/settingsShared";
import { useSettingsEditor } from "@/components/dashboard/settings/useSettingsEditor";

const COLOR_PRESETS = [
  { label: "Indigo", value: "#4f46e5" },
  { label: "Emerald", value: "#059669" },
  { label: "Orange", value: "#ea580c" },
  { label: "Rose", value: "#e11d48" },
  { label: "Sky", value: "#0284c7" },
  { label: "Violet", value: "#7c3aed" },
];

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

export default function GeneralSettings() {
  const { settings, isLoading, isError, error, refetch, save, isPending } = useSettingsEditor();
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_SETTINGS.primaryColor);
  const [shopShortDescription, setShopShortDescription] = useState(
    DEFAULT_SETTINGS.shopShortDescription
  );
  const [shopTagline, setShopTagline] = useState(DEFAULT_SETTINGS.shopTagline);
  const [copyrightText, setCopyrightText] = useState(DEFAULT_SETTINGS.copyrightText);
  const [shopLogo, setShopLogo] = useState(null);
  const [favicon, setFavicon] = useState(null);
  const [socialLinks, setSocialLinks] = useState(DEFAULT_SETTINGS.socialLinks);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setPrimaryColor(settings.primaryColor);
    setShopShortDescription(
      settings.shopShortDescription || DEFAULT_SETTINGS.shopShortDescription
    );
    setShopTagline(settings.shopTagline || DEFAULT_SETTINGS.shopTagline);
    setCopyrightText(settings.copyrightText || DEFAULT_SETTINGS.copyrightText);
    setShopLogo(settings.shopLogo || null);
    setFavicon(settings.favicon || null);
    setSocialLinks(settings.socialLinks || DEFAULT_SETTINGS.socialLinks);
  }, [settings]);

  const previewTheme = deriveThemeColors(normalizeHexColor(primaryColor));

  async function handleAssetUpload(event, type) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("শুধু image file দিন");
      return;
    }

    const setUploading = type === "logo" ? setIsUploadingLogo : setIsUploadingFavicon;
    const setAsset = type === "logo" ? setShopLogo : setFavicon;

    setUploading(true);

    try {
      const asset = await uploadBrandAsset(file, type);
      setAsset(asset);
      toast.success(
        type === "logo" ? "লোগো আপলোড হয়েছে — Save চাপুন" : "Favicon আপলোড হয়েছে — Save চাপুন"
      );
    } catch (uploadError) {
      toast.error(uploadError.message || "আপলোড ব্যর্থ");
    } finally {
      setUploading(false);
      if (type === "logo" && logoInputRef.current) logoInputRef.current.value = "";
      if (type === "favicon" && faviconInputRef.current) faviconInputRef.current.value = "";
    }
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

    save({
      primaryColor: normalizeHexColor(primaryColor),
      shopShortDescription: shopShortDescription.trim(),
      shopTagline: shopTagline.trim(),
      copyrightText: copyrightText.trim(),
      shopLogo,
      favicon,
      socialLinks: socialLinks.map((link) => ({
        ...link,
        url: link.url.trim(),
        enabled: Boolean(link.enabled && link.url.trim()),
      })),
    });
  }

  return (
    <SettingsPageShell
      title="General"
      description="Logo, favicon, brand color ar footer content manage korun."
      onSubmit={handleSubmit}
      isPending={isPending}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={refetch}
    >
      <section className="dash-card mb-6 p-5 sm:p-6">
        <h2 className="text-lg font-bold text-dash-text">Logo & Favicon</h2>
        <p className="mt-1 text-sm text-dash-muted">
          Navbar, footer ar browser tab e show hobe. Upload korar por Save চাপুন।
        </p>

        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div className="rounded-md border border-dash-border bg-slate-50/70 p-4">
            <p className="text-xs font-semibold tracking-wide text-dash-muted uppercase">
              Shop Logo
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border border-dash-border bg-white">
                {getShopLogoUrl({ shopLogo }) ? (
                  <Image
                    src={getShopLogoUrl({ shopLogo })}
                    alt="Logo preview"
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                  />
                ) : (
                  <span className="text-[11px] text-dash-muted">No logo</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleAssetUpload(event, "logo")}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={isUploadingLogo || isPending}
                  className="inline-flex items-center gap-2 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-60"
                >
                  {isUploadingLogo ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ImagePlus className="h-3.5 w-3.5" />
                  )}
                  {shopLogo ? "Change Logo" : "Upload Logo"}
                </button>
                {shopLogo ? (
                  <button
                    type="button"
                    onClick={() => setShopLogo(null)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
            <p className="mt-2 text-[11px] text-dash-muted">
              PNG, JPG, SVG — transparent background ভালো।
            </p>
          </div>

          <div className="rounded-md border border-dash-border bg-slate-50/70 p-4">
            <p className="text-xs font-semibold tracking-wide text-dash-muted uppercase">Favicon</p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border border-dash-border bg-white">
                {getFaviconUrl({ favicon }) ? (
                  <Image
                    src={getFaviconUrl({ favicon })}
                    alt="Favicon preview"
                    fill
                    sizes="64px"
                    className="object-contain p-2"
                  />
                ) : (
                  <span className="text-[11px] text-dash-muted">Default</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleAssetUpload(event, "favicon")}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => faviconInputRef.current?.click()}
                  disabled={isUploadingFavicon || isPending}
                  className="inline-flex items-center gap-2 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-60"
                >
                  {isUploadingFavicon ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ImagePlus className="h-3.5 w-3.5" />
                  )}
                  {favicon ? "Change Favicon" : "Upload Favicon"}
                </button>
                {favicon ? (
                  <button
                    type="button"
                    onClick={() => setFavicon(null)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
            <p className="mt-2 text-[11px] text-dash-muted">
              32×32 বা 64×64 PNG/ICO recommended — browser tab icon।
            </p>
          </div>
        </div>
      </section>

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
          <h2 className="text-lg font-bold text-dash-text">Shop Content</h2>
          <p className="mt-1 text-sm text-dash-muted">
            Footer er short description, tagline ar copyright text edit korun.
          </p>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-dash-muted">
                Short Description
              </label>
              <textarea
                rows={3}
                value={shopShortDescription}
                onChange={(event) => setShopShortDescription(event.target.value)}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-dash-muted">Tagline</label>
              <input
                value={shopTagline}
                onChange={(event) => setShopTagline(event.target.value)}
                className={inputClass}
                placeholder="আধুনিক ই-কমার্সের জন্য তৈরি"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-dash-muted">
                Copyright Text
              </label>
              <input
                value={copyrightText}
                onChange={(event) => setCopyrightText(event.target.value)}
                className={inputClass}
                placeholder="© {year} Nexa. সর্বস্বত্ব সংরক্ষিত।"
              />
              <p className="mt-1 text-[11px] text-dash-muted">
                {`{year}`} লিখলে বর্তমান বছর auto বসবে।
              </p>
            </div>
          </div>
        </section>

        <section className="dash-card p-5 sm:p-6 lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-dash-text">Social Links</h2>
              <p className="mt-1 text-sm text-dash-muted">
                Footer e show hobe. URL na thakle disable thakbe.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSocialLinks((current) => [...current, createSocialLink()])}
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
                      <label className="mb-1 block text-xs font-semibold text-dash-muted">URL</label>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(event) => handleSocialChange(link.id, "url", event.target.value)}
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
                        onClick={() =>
                          setSocialLinks((current) => current.filter((entry) => entry.id !== link.id))
                        }
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
      </div>
    </SettingsPageShell>
  );
}
