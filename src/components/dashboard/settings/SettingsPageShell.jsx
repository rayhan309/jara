"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import DashPageHeader from "@/components/dashboard/DashPageHeader";
import { settingsPaperSx } from "@/components/dashboard/settings/settingsShared";

export default function SettingsPageShell({
  title,
  description,
  onSubmit,
  isPending,
  children,
  isLoading,
  isError,
  error,
  onRetry,
}) {
  if (isLoading) {
    return (
      <Paper
        elevation={0}
        sx={{
          ...settingsPaperSx,
          minHeight: 280,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={32} />
      </Paper>
    );
  }

  if (isError) {
    return (
      <Paper
        elevation={0}
        sx={{
          ...settingsPaperSx,
          borderColor: "error.light",
          bgcolor: "error.50",
          textAlign: "center",
        }}
      >
        <Alert severity="error" sx={{ justifyContent: "center", bgcolor: "transparent" }}>
          {error?.message || "Failed to load settings."}
        </Alert>
        <Button type="button" onClick={onRetry} sx={{ mt: 1.5 }}>
          Try again
        </Button>
      </Paper>
    );
  }

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={3}>
        <DashPageHeader
          eyebrow="Settings"
          title={title}
          description={description}
          action={
            <Button
              type="submit"
              variant="contained"
              disabled={isPending}
              startIcon={
                isPending ? <CircularProgress size={16} color="inherit" /> : <SaveRoundedIcon />
              }
            >
              Save
            </Button>
          }
        />

        {children}
      </Stack>
    </Box>
  );
}
