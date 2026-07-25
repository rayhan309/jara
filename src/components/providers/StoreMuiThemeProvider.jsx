"use client";

import { useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useStoreSettings } from "@/components/providers/SiteSettingsProvider";
import { DEFAULT_SETTINGS, deriveThemeColors, normalizeHexColor } from "@/lib/siteSettings";

export default function StoreMuiThemeProvider({ children }) {
  const settings = useStoreSettings();

  const theme = useMemo(() => {
    const primary = normalizeHexColor(
      settings?.primaryColor || DEFAULT_SETTINGS.primaryColor
    );
    const colors = deriveThemeColors(primary);

    return createTheme({
      cssVariables: true,
      typography: {
        fontFamily: "var(--font-hind-siliguri), 'Hind Siliguri', sans-serif",
        button: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
      shape: {
        borderRadius: 6,
      },
      palette: {
        mode: "light",
        primary: {
          main: colors.primaryColor,
          dark: colors.primaryColorHover,
          light: colors.primaryColorBorder,
          contrastText: "#ffffff",
        },
        secondary: {
          main: "#0f172a",
        },
        background: {
          default: "#fafafa",
          paper: "#ffffff",
        },
        text: {
          primary: "#0f172a",
          secondary: "#64748b",
        },
        divider: "#e2e8f0",
      },
      components: {
        MuiButton: {
          defaultProps: {
            disableElevation: true,
          },
          styleOverrides: {
            root: {
              borderRadius: 6,
            },
          },
        },
        MuiIconButton: {
          styleOverrides: {
            root: {
              borderRadius: 6,
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 6,
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: "none",
              borderRadius: 6,
            },
            rounded: {
              borderRadius: 6,
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 6,
            },
          },
        },
        MuiTextField: {
          defaultProps: {
            variant: "outlined",
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              borderRadius: 6,
            },
          },
        },
        MuiFab: {
          styleOverrides: {
            root: {
              borderRadius: 6,
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              borderRadius: 0,
            },
          },
        },
      },
    });
  }, [settings?.primaryColor]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
