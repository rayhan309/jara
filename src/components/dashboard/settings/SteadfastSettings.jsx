"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { DEFAULT_SETTINGS, normalizeSteadfastBaseUrl } from "@/lib/siteSettings";
import SettingsPageShell from "@/components/dashboard/settings/SettingsPageShell";
import { settingsPaperSx, textFieldSize } from "@/components/dashboard/settings/settingsShared";
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
      toast.error("Enter the Steadfast API Key");
      return;
    }

    if (enabled && !secretKey.trim() && !secretKeySet) {
      toast.error("Enter the Steadfast Secret Key");
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
      toast.error("Enter the API Key");
      return;
    }

    if (!secretKey.trim() && !secretKeySet) {
      toast.error("Enter the Secret Key or save credentials first");
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

  const statusSeverity = enabled && isConfigured ? "success" : enabled ? "warning" : "info";
  const statusMessage =
    enabled && isConfigured
      ? "Active — Steadfast API will be used"
      : enabled
        ? "Enter API Key and Secret Key, then click Save"
        : "Integration off — orders cannot be sent to Steadfast";

  return (
    <SettingsPageShell
      title="Steadfast Courier"
      description="Enter Steadfast API credentials. Orders can then be sent to Steadfast from the Orders page."
      onSubmit={handleSubmit}
      isPending={isPending}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={refetch}
    >
      <Paper elevation={0} sx={settingsPaperSx}>
        <Stack spacing={2}>
          <TextField
            label="Base URL"
            size={textFieldSize}
            fullWidth
            type="url"
            value={baseUrl}
            onChange={(event) => setBaseUrl(event.target.value)}
            placeholder="https://portal.packzy.com/api/v1"
          />

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            }}
          >
            <TextField
              label="API Key"
              size={textFieldSize}
              fullWidth
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="Your Steadfast API Key"
              autoComplete="off"
              sx={{ "& input": { fontFamily: "monospace", fontSize: 12 } }}
            />
            <TextField
              label="Secret Key"
              size={textFieldSize}
              fullWidth
              type="password"
              value={secretKey}
              onChange={(event) => setSecretKey(event.target.value)}
              placeholder={
                secretKeySet ? "Saved — enter a new key to change" : "Your Steadfast Secret Key"
              }
              autoComplete="new-password"
              sx={{ "& input": { fontFamily: "monospace", fontSize: 12 } }}
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={enabled}
                onChange={(event) => setEnabled(event.target.checked)}
              />
            }
            label="Enable Steadfast integration"
            sx={{
              m: 0,
              width: "fit-content",
              px: 1.5,
              py: 0.5,
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "background.paper",
            }}
          />
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
          <Alert severity={statusSeverity} sx={{ flex: 1, minWidth: 220 }}>
            {statusMessage}
          </Alert>
          <Button
            type="button"
            variant="outlined"
            onClick={handleTestConnection}
            disabled={testing || isPending}
            startIcon={testing ? <CircularProgress size={14} color="inherit" /> : null}
          >
            Test Connection
          </Button>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
          Find credentials in Steadfast Dashboard → API Settings. Values in `.env` are used as a
          fallback until you save credentials here.
        </Typography>
      </Paper>
    </SettingsPageShell>
  );
}
