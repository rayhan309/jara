"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { DEFAULT_SETTINGS } from "@/lib/siteSettings";
import SettingsPageShell from "@/components/dashboard/settings/SettingsPageShell";
import { settingsPaperSx, textFieldSize } from "@/components/dashboard/settings/settingsShared";
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
      toast.error("Enter a contact phone number");
      return;
    }
    if (!contactEmail.trim()) {
      toast.error("Enter a contact email address");
      return;
    }
    if (!contactAddress.trim()) {
      toast.error("Enter a contact address");
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
      description="Update contact details shown in the storefront footer, navbar, and support pages."
      onSubmit={handleSubmit}
      isPending={isPending}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={refetch}
    >
      <Paper elevation={0} sx={settingsPaperSx}>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          }}
        >
          <TextField
            id="contact-phone"
            label="Phone Number"
            size={textFieldSize}
            fullWidth
            value={contactPhone}
            onChange={(event) => setContactPhone(event.target.value)}
            placeholder="+8801815131040"
          />
          <TextField
            id="contact-email"
            label="Email Address"
            size={textFieldSize}
            fullWidth
            type="email"
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
            placeholder="support@raisasglamnest.com"
          />
          <TextField
            id="contact-address"
            label="Physical Address"
            size={textFieldSize}
            fullWidth
            value={contactAddress}
            onChange={(event) => setContactAddress(event.target.value)}
            placeholder="Dhaka, Bangladesh"
            sx={{ gridColumn: { sm: "1 / -1" } }}
          />
        </Box>
      </Paper>
    </SettingsPageShell>
  );
}
