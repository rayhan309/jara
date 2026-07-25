"use client";

import Image from "next/image";
import Box from "@mui/material/Box";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";

/** Trimmed wordmark ≈ 520×255 (~2∶1) */
const LOGO_ASPECT = 520 / 255;

const SIZE_MAP = {
  xs: { height: 44, icon: 14 },
  sm: { height: 52, icon: 16 },
  md: { height: 58, icon: 20 },
  lg: { height: 68, icon: 24 },
};

export default function ShopLogo({
  logoUrl,
  size = "md",
  sx = {},
  fallbackSx = {},
}) {
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;
  const width = Math.round(sizeConfig.height * LOGO_ASPECT);

  if (logoUrl) {
    return (
      <Box
        sx={{
          display: "block",
          flexShrink: 0,
          lineHeight: 0,
          borderRadius: 1,
          overflow: "hidden",
          ...sx,
        }}
      >
        <Image
          src={logoUrl}
          alt="Raisa's Glam Nest"
          width={width}
          height={sizeConfig.height}
          priority={size === "md" || size === "lg"}
          unoptimized
          style={{
            display: "block",
            width,
            height: sizeConfig.height,
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: sizeConfig.height,
        height: sizeConfig.height,
        flexShrink: 0,
        borderRadius: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "primary.main",
        color: "primary.contrastText",
        ...fallbackSx,
        ...sx,
      }}
    >
      <StorefrontRoundedIcon sx={{ fontSize: sizeConfig.icon }} />
    </Box>
  );
}
