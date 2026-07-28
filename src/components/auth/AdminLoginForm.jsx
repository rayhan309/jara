"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { getAdminAuth, isAdminAuthenticated, setAdminAuth } from "@/lib/auth";
import { getDefaultDashboardPath } from "@/lib/adminRoles";
import { ADMIN_NAME, SITE_NAME_SHORT } from "@/lib/siteMetadata";

export default function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    if (isAdminAuthenticated()) {
      router.replace(getDefaultDashboardPath(getAdminAuth()?.role));
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- session gate before rendering login form
    setCheckingSession(false);
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      setAdminAuth(data);
      router.replace(getDefaultDashboardPath(data.role));
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default" }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        bgcolor: "background.default",
        px: 2,
        py: 5,
      }}
    >
      <Box
        aria-hidden
        sx={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          "&::before": {
            content: '""',
            position: "absolute",
            top: -96,
            right: "-10%",
            width: 320,
            height: 320,
            borderRadius: "50%",
            bgcolor: "primary.light",
            opacity: 0.35,
            filter: "blur(64px)",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: -96,
            left: "-10%",
            width: 288,
            height: 288,
            borderRadius: "50%",
            bgcolor: "grey.300",
            opacity: 0.35,
            filter: "blur(64px)",
          },
        }}
      />

      <Box sx={{ position: "relative", width: 1, maxWidth: 384 }}>
        <Box sx={{ mb: 3, textAlign: "center" }}>
          <Typography
            variant="caption"
            fontWeight={700}
            color="primary"
            sx={{ letterSpacing: "0.16em", textTransform: "uppercase" }}
          >
            {SITE_NAME_SHORT}
          </Typography>
          <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5 }}>
            {ADMIN_NAME}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            Sign in to manage your store
          </Typography>
        </Box>

        <Paper
          component="form"
          onSubmit={handleSubmit}
          elevation={0}
          sx={{
            p: 3,
            border: 1,
            borderColor: "divider",
            boxShadow: "0 16px 40px -20px rgba(15,23,42,0.2)",
          }}
        >
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}

            <TextField
              label="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
              fullWidth
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
              {loading ? <CircularProgress size={20} color="inherit" /> : "Sign in"}
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
