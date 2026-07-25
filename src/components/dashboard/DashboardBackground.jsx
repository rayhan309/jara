"use client";

import Box from "@mui/material/Box";

export default function DashboardBackground() {
  return (
    <Box sx={{ pointerEvents: "none", position: "absolute", inset: 0, overflow: "hidden" }}>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.22,
          backgroundImage: `
            linear-gradient(to right, #e2e8f0 1px, transparent 1px),
            linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 0%, black 35%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 0%, black 35%, transparent 100%)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: -112,
          right: "-6%",
          width: 448,
          height: 448,
          borderRadius: "50%",
          bgcolor: "primary.light",
          opacity: 0.25,
          filter: "blur(64px)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -144,
          left: "-8%",
          width: 352,
          height: 352,
          borderRadius: "50%",
          bgcolor: "grey.300",
          opacity: 0.25,
          filter: "blur(64px)",
        }}
      />
    </Box>
  );
}
