"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { useAdminAuth } from "@/components/auth/AdminAuthGuard";
import { getRoleLabel, hasPermission, PERMISSIONS } from "@/lib/adminRoles";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardBackground from "@/components/dashboard/DashboardBackground";

function getGreeting(date) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(date, long = true) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: long ? "long" : undefined,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "A";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function DashboardShell({ children }) {
  const auth = useAdminAuth();
  const username = auth?.name || auth?.username || "Admin";
  const roleLabel = getRoleLabel(auth?.role);
  const initials = getInitials(username);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [now, setNow] = useState(null);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const menuOpen = Boolean(menuAnchor);
  const canAccessSettings = hasPermission(auth?.role, PERMISSIONS.SETTINGS);

  useEffect(() => {
    setNow(new Date());
  }, []);

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden", bgcolor: "background.default" }}>
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <Box sx={{ position: "relative", display: "flex", minWidth: 0, minHeight: 0, flex: 1, flexDirection: "column", overflow: "hidden" }}>
        <DashboardBackground />

        <AppBar
          position="relative"
          color="inherit"
          elevation={0}
          sx={{
            zIndex: 20,
            flexShrink: 0,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(12px)",
          }}
        >
          <Toolbar sx={{ minHeight: { xs: 64, sm: 64 }, px: { xs: 1.5, sm: 2.5, lg: 3 }, gap: 1.5 }}>
            <IconButton
              aria-label="Open menu"
              onClick={openSidebar}
              sx={{
                display: { lg: "none" },
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <MenuRoundedIcon fontSize="small" />
            </IconButton>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={800} noWrap sx={{ lineHeight: 1.2 }}>
                <Box component="span" sx={{ display: { xs: "inline", md: "none" } }}>
                  Hi, {username}
                </Box>
                <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>
                  {now ? `${getGreeting(now)}, ${username}` : `Hi, ${username}`}
                </Box>
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                  {now ? formatDate(now, false) : "\u00a0"}
                </Box>
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                  {now ? formatDate(now, true) : "\u00a0"}
                </Box>
              </Typography>
            </Box>

            <Box>
              <Box
                component="button"
                type="button"
                aria-label="Account menu"
                aria-expanded={menuOpen}
                onClick={(event) => setMenuAnchor(event.currentTarget)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  height: 40,
                  px: { xs: 1, sm: 1.25 },
                  minWidth: { sm: 168 },
                  border: 1,
                  borderColor: menuOpen ? "primary.light" : "divider",
                  borderRadius: 1,
                  bgcolor: "background.paper",
                  cursor: "pointer",
                  boxShadow: menuOpen ? (theme) => `0 0 0 3px ${theme.palette.primary.main}22` : "none",
                }}
              >
                <Avatar sx={{ width: 28, height: 28, bgcolor: "primary.main", fontSize: 11, fontWeight: 700 }}>
                  {initials}
                </Avatar>
                <Box sx={{ display: { xs: "none", sm: "flex" }, minWidth: 0, flex: 1, flexDirection: "column", textAlign: "left" }}>
                  <Typography variant="body2" fontWeight={700} noWrap sx={{ lineHeight: 1.2 }}>
                    {username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {roleLabel}
                  </Typography>
                </Box>
                <KeyboardArrowDownRoundedIcon
                  sx={{
                    display: { xs: "none", sm: "block" },
                    fontSize: 18,
                    color: "text.disabled",
                    transform: menuOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s ease",
                  }}
                />
              </Box>

              <Menu
                anchorEl={menuAnchor}
                open={menuOpen}
                onClose={() => setMenuAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{
                  paper: {
                    sx: { mt: 1, minWidth: 208, border: 1, borderColor: "divider" },
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="body2" fontWeight={700} noWrap>
                    {username}
                  </Typography>
                  <Typography variant="caption" color="primary" fontWeight={600} noWrap>
                    {roleLabel}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem
                  component={Link}
                  href="/dashboard/account"
                  onClick={() => setMenuAnchor(null)}
                >
                  <ListItemIcon>
                    <PersonOutlineRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                {canAccessSettings ? (
                  <MenuItem
                    component={Link}
                    href="/dashboard/settings/general"
                    onClick={() => setMenuAnchor(null)}
                  >
                    <ListItemIcon>
                      <SettingsOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    Settings
                  </MenuItem>
                ) : null}
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            position: "relative",
            zIndex: 10,
            minHeight: 0,
            flex: 1,
            overflowX: "hidden",
            overflowY: "auto",
            p: { xs: 1.5, sm: 2.5, lg: 3.5 },
            pb: "max(0.75rem, env(safe-area-inset-bottom))",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
