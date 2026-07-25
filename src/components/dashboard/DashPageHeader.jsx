"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { motion } from "motion/react";

export default function DashPageHeader({
  eyebrow,
  title,
  description,
  action,
  sx = {},
  animate = true,
}) {
  const content = (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{ alignItems: { sm: "center" }, justifyContent: "space-between", ...sx }}
    >
      <Box sx={{ minWidth: 0 }}>
        {eyebrow ? (
          <Typography
            variant="caption"
            fontWeight={700}
            color="primary"
            sx={{ letterSpacing: "0.16em", textTransform: "uppercase" }}
          >
            {eyebrow}
          </Typography>
        ) : null}
        <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: "-0.02em" }}>
          {title}
        </Typography>
        {description ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 560, lineHeight: 1.6 }}>
            {description}
          </Typography>
        ) : null}
      </Box>
      {action ? <Box sx={{ flexShrink: 0, alignSelf: { xs: "flex-start", sm: "auto" } }}>{action}</Box> : null}
    </Stack>
  );

  if (!animate) return content;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
    >
      {content}
    </Box>
  );
}
