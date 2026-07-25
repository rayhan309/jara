"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

export default function HomeSectionHeader({
  eyebrow,
  title,
  subtitle,
  href,
  linkLabel = "View all",
  align = "left",
}) {
  const isCenter = align === "center";

  return (
    <Stack
      direction={{ xs: "column", sm: isCenter ? "column" : "row" }}
      spacing={2}
      alignItems={isCenter ? "center" : { xs: "stretch", sm: "flex-end" }}
      justifyContent="space-between"
      sx={{
        mb: { xs: 3.5, sm: 4 },
        pb: { xs: 2.5, sm: 3 },
        borderBottom: 1,
        borderColor: "divider",
        textAlign: isCenter ? "center" : "left",
      }}
    >
      <Box
        sx={{
          maxWidth: 640,
          ...(isCenter
            ? {}
            : {
                borderLeft: 3,
                borderColor: "primary.main",
                pl: { xs: 2, sm: 2.5 },
              }),
        }}
      >
        {eyebrow ? (
          <Typography
            variant="caption"
            fontWeight={700}
            color="primary"
            sx={{ letterSpacing: "0.22em", textTransform: "uppercase", display: "block", mb: 0.75 }}
          >
            {eyebrow}
          </Typography>
        ) : null}
        <Typography variant="h5" fontWeight={700} color="text.primary">
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: isCenter ? 480 : 560 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>

      {href ? (
        <Button
          component={Link}
          href={href}
          variant="outlined"
          endIcon={<ArrowForwardRoundedIcon />}
          sx={{ borderRadius: 1, alignSelf: isCenter ? "center" : { xs: "flex-start", sm: "auto" } }}
        >
          {linkLabel}
        </Button>
      ) : null}
    </Stack>
  );
}
