"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Paper from "@mui/material/Paper";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { DEFAULT_SETTINGS, normalizeMetaPixelId } from "@/lib/siteSettings";
import SettingsPageShell from "@/components/dashboard/settings/SettingsPageShell";
import { settingsPaperSx, textFieldSize } from "@/components/dashboard/settings/settingsShared";
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
      toast.error("Enter a valid Meta Pixel ID (at least 10 digits)");
      return;
    }

    save({
      metaPixelId: cleanedPixelId,
      metaPixelEnabled,
    });
  }

  const pixelReady = metaPixelEnabled && normalizeMetaPixelId(metaPixelId).length >= 10;
  const statusSeverity = pixelReady ? "success" : metaPixelEnabled ? "warning" : "info";
  const statusMessage = pixelReady
    ? "Active — Meta Pixel will load on the storefront"
    : metaPixelEnabled
      ? "Enter a Pixel ID and click Save"
      : "Pixel is off — tracking is disabled";

  return (
    <SettingsPageShell
      title="Meta Pixel"
      description="Enter your Pixel ID from Meta Events Manager. The storefront will track PageView, AddToCart, and Purchase."
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
            gridTemplateColumns: { xs: "1fr", sm: "1fr auto" },
            alignItems: { sm: "end" },
          }}
        >
          <Box>
            <TextField
              label="Pixel ID"
              size={textFieldSize}
              fullWidth
              inputMode="numeric"
              value={metaPixelId}
              onChange={(event) => setMetaPixelId(event.target.value)}
              placeholder="1234567890123456"
              sx={{ "& input": { fontFamily: "monospace" } }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
              Events Manager → Data Sources → Your Pixel → Settings → Pixel ID
            </Typography>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={metaPixelEnabled}
                onChange={(event) => setMetaPixelEnabled(event.target.checked)}
              />
            }
            label="Enable Pixel"
            sx={{
              m: 0,
              height: "fit-content",
              px: 1.5,
              py: 0.75,
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "background.paper",
            }}
          />
        </Box>

        <Alert severity={statusSeverity} sx={{ mt: 2 }}>
          {statusMessage}
        </Alert>
      </Paper>
    </SettingsPageShell>
  );
}
