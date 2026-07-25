"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { updateAdminAuthProfile } from "@/lib/auth";
import { getRoleLabel } from "@/lib/adminRoles";
import { useAdminProfile, useUpdateAdminProfile } from "@/hooks/useAdminUsers";
import DashPageHeader from "@/components/dashboard/DashPageHeader";

export default function AccountSettings() {
  const { data: profile, isLoading, isError, error, refetch } = useAdminProfile();
  const { mutate: saveProfile, isPending } = useUpdateAdminProfile();

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name || profile.username || "");
  }, [profile]);

  function handleSubmit(event) {
    event.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    saveProfile(
      {
        name: name.trim(),
        currentPassword: newPassword ? currentPassword : undefined,
        newPassword: newPassword || undefined,
      },
      {
        onSuccess: (user) => {
          updateAdminAuthProfile(user);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          toast.success("Account updated successfully");
        },
        onError: (saveError) => toast.error(saveError.message || "Update failed"),
      }
    );
  }

  if (isLoading) {
    return (
      <Paper
        elevation={0}
        sx={{
          minHeight: 280,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: 1,
          borderColor: "divider",
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
        sx={{ p: 3, border: 1, borderColor: "error.light", bgcolor: "error.50", textAlign: "center" }}
      >
        <Typography variant="body2" color="error">
          {error?.message || "Failed to load account."}
        </Typography>
        <Button onClick={() => refetch()} sx={{ mt: 1.5 }}>
          Try again
        </Button>
      </Paper>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mx: "auto", maxWidth: 560 }}>
      <Stack spacing={3}>
        <DashPageHeader
          eyebrow="Account"
          title="My Account"
          description="Update your name and password."
          animate={false}
        />

        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, border: 1, borderColor: "divider" }}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Username"
              value={profile?.username || ""}
              disabled
            />
            <TextField
              fullWidth
              label="Role"
              value={getRoleLabel(profile?.role)}
              disabled
            />
            <TextField
              fullWidth
              id="account-name"
              label="Display Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, border: 1, borderColor: "divider" }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5 }}>
            Change Password
          </Typography>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              id="current-password"
              label="Current Password"
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showCurrent ? "Hide password" : "Show password"}
                      onClick={() => setShowCurrent((prev) => !prev)}
                      edge="end"
                      size="small"
                    >
                      {showCurrent ? (
                        <VisibilityOffOutlinedIcon fontSize="small" />
                      ) : (
                        <VisibilityOutlinedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              id="new-password"
              label="New Password"
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showNew ? "Hide password" : "Show password"}
                      onClick={() => setShowNew((prev) => !prev)}
                      edge="end"
                      size="small"
                    >
                      {showNew ? (
                        <VisibilityOffOutlinedIcon fontSize="small" />
                      ) : (
                        <VisibilityOutlinedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              id="confirm-password"
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
            />
          </Stack>
        </Paper>

        <Box>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending}
            startIcon={
              isPending ? <CircularProgress size={16} color="inherit" /> : <SaveRoundedIcon />
            }
          >
            Save Changes
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
