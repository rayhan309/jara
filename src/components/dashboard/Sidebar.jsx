"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import PeopleOutlineRoundedIcon from "@mui/icons-material/PeopleOutlineRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import GpsFixedOutlinedIcon from "@mui/icons-material/GpsFixedOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { logoutAdmin } from "@/lib/api/adminUsers";
import { clearAdminAuth, getAdminAuth } from "@/lib/auth";
import { getNavItemsForRole, getRoleLabel } from "@/lib/adminRoles";
import { useStoreSettings } from "@/components/providers/SiteSettingsProvider";
import ShopLogo from "@/components/layout/ShopLogo";
import { getShopLogoUrl } from "@/lib/siteSettings";
import { SITE_NAME_SHORT } from "@/lib/siteMetadata";

const DRAWER_WIDTH = 232;

const ICONS = {
  overview: DashboardOutlinedIcon,
  orders: ShoppingBagOutlinedIcon,
  products: Inventory2OutlinedIcon,
  attributes: TuneOutlinedIcon,
  categories: CategoryOutlinedIcon,
  customers: PeopleOutlineRoundedIcon,
  settings: SettingsOutlinedIcon,
  reports: BarChartOutlinedIcon,
  palette: PaletteOutlinedIcon,
  target: GpsFixedOutlinedIcon,
  truck: LocalShippingOutlinedIcon,
  mail: MailOutlineRoundedIcon,
  image: ImageOutlinedIcon,
  users: ManageAccountsOutlinedIcon,
  account: PersonOutlineRoundedIcon,
};

function getInitialOpenGroups(pathname, navItems) {
  return navItems.reduce((groups, item) => {
    if (item.type === "group") {
      groups[item.label] = item.match?.(pathname) || false;
    }
    return groups;
  }, {});
}

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const auth = getAdminAuth();
  const settings = useStoreSettings();
  const logoUrl = getShopLogoUrl(settings);
  const navItems = getNavItemsForRole(auth?.role);
  const [openGroups, setOpenGroups] = useState(() => getInitialOpenGroups(pathname, navItems));

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- expand active nav groups when route changes
    setOpenGroups((current) => {
      const next = { ...current };
      navItems.forEach((item) => {
        if (item.type === "group" && item.match?.(pathname)) {
          next[item.label] = true;
        }
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- navItems derived from auth.role
  }, [pathname, auth?.role]);

  function toggleGroup(label) {
    setOpenGroups((current) => ({ ...current, [label]: !current[label] }));
  }

  async function handleLogout() {
    try {
      await logoutAdmin();
    } catch {
      // ignore network errors during logout
    } finally {
      clearAdminAuth();
      router.replace("/admin/login");
    }
  }

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: 1, bgcolor: "#0f172a", color: "common.white" }}>
      <Stack
        direction="row"
        sx={{
          px: 2,
          py: 2,
          borderBottom: "1px solid rgba(148,163,184,0.16)",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Stack direction="row" spacing={1.25} sx={{ minWidth: 0, alignItems: "center" }}>
          <ShopLogo logoUrl={logoUrl} size="xs" />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} noWrap>
              {SITE_NAME_SHORT}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(148,163,184,0.9)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Admin
            </Typography>
          </Box>
        </Stack>
        <IconButton
          aria-label="Close sidebar"
          onClick={onClose}
          size="small"
          sx={{ display: { lg: "none" }, color: "rgba(148,163,184,0.9)", border: "1px solid rgba(148,163,184,0.25)", borderRadius: 1 }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Box sx={{ px: 1.25, pt: 2, flex: 1, overflowY: "auto" }}>
        <Typography
          variant="caption"
          sx={{ display: "block", px: 1.25, mb: 1, color: "rgba(100,116,139,1)", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}
        >
          Main Menu
        </Typography>
        <List dense disablePadding>
          {navItems.map((item) => {
            if (item.type === "group") {
              const groupActive = item.match?.(pathname);
              const groupOpen = openGroups[item.label];
              const Icon = ICONS[item.icon] || SettingsOutlinedIcon;

              return (
                <Box key={item.label}>
                  <ListItemButton
                    onClick={() => toggleGroup(item.label)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.25,
                      color: groupActive ? "common.white" : "rgba(148,163,184,0.95)",
                      bgcolor: groupActive ? "rgba(255,255,255,0.09)" : "transparent",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 34, color: groupActive ? "primary.light" : "rgba(100,116,139,1)" }}>
                      <Icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
                    {groupOpen ? <ExpandLessRoundedIcon fontSize="small" /> : <ExpandMoreRoundedIcon fontSize="small" />}
                  </ListItemButton>
                  <Collapse in={groupOpen} timeout="auto" unmountOnExit>
                    <List dense disablePadding sx={{ ml: 2, pl: 1, borderLeft: "1px solid rgba(51,65,85,0.8)" }}>
                      {item.children.map((child) => {
                        const childActive = pathname === child.href || pathname.startsWith(`${child.href}/`);
                        const ChildIcon = ICONS[child.icon] || Inventory2OutlinedIcon;
                        return (
                          <ListItemButton
                            key={child.href}
                            component={Link}
                            href={child.href}
                            onClick={onClose}
                            sx={{
                              borderRadius: 1,
                              mb: 0.25,
                              py: 0.75,
                              color: childActive ? "primary.light" : "rgba(148,163,184,0.8)",
                              bgcolor: childActive ? "rgba(99,102,241,0.15)" : "transparent",
                              "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 28, color: "inherit" }}>
                              <ChildIcon sx={{ fontSize: 16 }} />
                            </ListItemIcon>
                            <ListItemText primary={child.label} primaryTypographyProps={{ fontSize: 12, fontWeight: childActive ? 600 : 500 }} />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                </Box>
              );
            }

            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
            const Icon = ICONS[item.icon] || DashboardOutlinedIcon;

            return (
              <ListItemButton
                key={item.href}
                component={Link}
                href={item.href}
                onClick={onClose}
                sx={{
                  borderRadius: 1,
                  mb: 0.25,
                  color: active ? "common.white" : "rgba(148,163,184,0.95)",
                  bgcolor: active ? "rgba(255,255,255,0.09)" : "transparent",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 34, color: active ? "primary.light" : "rgba(100,116,139,1)" }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Box sx={{ borderTop: "1px solid rgba(148,163,184,0.16)", p: 1.5 }}>
        <Stack direction="row" spacing={1.25} sx={{ mb: 1, px: 1, py: 1, borderRadius: 1, bgcolor: "rgba(255,255,255,0.04)", alignItems: "center" }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              flexShrink: 0,
            }}
          >
            {(auth?.username || "A").charAt(0)}
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="caption" fontWeight={600} noWrap sx={{ display: "block", color: "rgba(226,232,240,1)" }}>
              {auth?.name || auth?.username || "Admin"}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: "rgba(100,116,139,1)" }}>
              {getRoleLabel(auth?.role)}
            </Typography>
          </Box>
        </Stack>
        <Button
          fullWidth
          onClick={handleLogout}
          startIcon={<LogoutRoundedIcon />}
          sx={{
            color: "rgba(148,163,184,0.95)",
            border: "1px solid rgba(51,65,85,0.9)",
            fontSize: 11,
            "&:hover": {
              color: "#fca5a5",
              borderColor: "rgba(239,68,68,0.4)",
              bgcolor: "rgba(239,68,68,0.08)",
            },
          }}
        >
          Sign Out
        </Button>
      </Box>
    </Box>
  );

  if (isDesktop) {
    return (
      <Drawer
        variant="permanent"
        open
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            border: 0,
            position: "relative",
            height: "100vh",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="temporary"
      open={isOpen}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          maxWidth: "82vw",
          boxSizing: "border-box",
          border: 0,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
