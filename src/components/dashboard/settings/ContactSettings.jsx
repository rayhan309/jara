"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { DEFAULT_SETTINGS } from "@/lib/siteSettings";
import SettingsPageShell from "@/components/dashboard/settings/SettingsPageShell";
import { inputClass } from "@/components/dashboard/settings/settingsShared";
import { useSettingsEditor } from "@/components/dashboard/settings/useSettingsEditor";

export default function ContactSettings() {
  const { settings, isLoading, isError, error, refetch, save, isPending } = useSettingsEditor();
  const [contactPhone, setContactPhone] = useState(DEFAULT_SETTINGS.contactPhone || "");
  const [contactEmail, setContactEmail] = useState(DEFAULT_SETTINGS.contactEmail || "");
  const [contactAddress, setContactAddress] = useState(DEFAULT_SETTINGS.contactAddress || "");

  useEffect(() => {
    if (!settings) return;
    setContactPhone(settings.contactPhone || DEFAULT_SETTINGS.contactPhone || "");
    setContactEmail(settings.contactEmail || DEFAULT_SETTINGS.contactEmail || "");
    setContactAddress(settings.contactAddress || DEFAULT_SETTINGS.contactAddress || "");
  }, [settings]);

  function handleSubmit(event) {
    event.preventDefault();

    if (!contactPhone.trim()) {
      toast.error("যোগাযোগের ফোন নম্বর দিন");
      return;
    }
    if (!contactEmail.trim()) {
      toast.error("যোগাযোগের ইমেইল দিন");
      return;
    }
    if (!contactAddress.trim()) {
      toast.error("যোগাযোগের ঠিকানা দিন");
      return;
    }

    save({
      contactPhone: contactPhone.trim(),
      contactEmail: contactEmail.trim(),
      contactAddress: contactAddress.trim(),
    });
  }

  return (
    <SettingsPageShell
      title="Contact"
      description="Storefront footer, navbar, ar support page ar contact details update korun."
      onSubmit={handleSubmit}
      isPending={isPending}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={refetch}
    >
      <section className="dash-card p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-phone" className="mb-1 block text-xs font-semibold text-dash-muted">
              Phone Number
            </label>
            <input
              id="contact-phone"
              type="text"
              value={contactPhone}
              onChange={(event) => setContactPhone(event.target.value)}
              placeholder="+8801815131040"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="contact-email" className="mb-1 block text-xs font-semibold text-dash-muted">
              Email Address
            </label>
            <input
              id="contact-email"
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              placeholder="support@nexa.com"
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="contact-address" className="mb-1 block text-xs font-semibold text-dash-muted">
              Physical Address
            </label>
            <input
              id="contact-address"
              type="text"
              value={contactAddress}
              onChange={(event) => setContactAddress(event.target.value)}
              placeholder="ঢাকা, বাংলাদেশ"
              className={inputClass}
            />
          </div>
        </div>
      </section>
    </SettingsPageShell>
  );
}
