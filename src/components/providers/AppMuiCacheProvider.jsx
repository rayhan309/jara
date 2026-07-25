"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import GlobalStyles from "@mui/material/GlobalStyles";

/**
 * Emotion cache for App Router — prevents MUI/CssBaseline hydration mismatches.
 * CSS layers keep Tailwind utilities above MUI when both are present.
 */
export default function AppMuiCacheProvider({ children }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
      {children}
    </AppRouterCacheProvider>
  );
}
