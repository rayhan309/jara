"use client";

import MetaPixel from "@/components/analytics/MetaPixel";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackToTopButton from "@/components/layout/BackToTopButton";
import StoreMuiThemeProvider from "@/components/providers/StoreMuiThemeProvider";
import Box from "@mui/material/Box";

export default function StoreShell({ children, sx = {}, className }) {
  return (
    <StoreMuiThemeProvider>
      <Box
        className={className}
        sx={{
          display: "flex",
          minHeight: "100vh",
          minWidth: 0,
          flexDirection: "column",
          overflowX: "clip",
          bgcolor: "background.default",
          ...sx,
        }}
      >
        <MetaPixel />
        <Navbar />
        <Box component="main" sx={{ minWidth: 0, flex: 1 }}>
          {children}
        </Box>
        <Footer />
        <BackToTopButton />
      </Box>
    </StoreMuiThemeProvider>
  );
}
