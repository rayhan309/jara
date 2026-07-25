"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import { motion } from "motion/react";

export default function PagePlaceholder({ title, description, icon: Icon }) {
  const ResolvedIcon = Icon || BuildOutlinedIcon;

  return (
    <Paper
      component={motion.div}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      elevation={0}
      sx={{
        minHeight: 480,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 6,
        textAlign: "center",
        border: 1,
        borderColor: "divider",
      }}
    >
      <Box
        component={motion.div}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        sx={{
          position: "relative",
          mb: 3,
          width: 80,
          height: 80,
          borderRadius: 1,
          border: 1,
          borderColor: "primary.light",
          bgcolor: "primary.50",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ResolvedIcon sx={{ fontSize: 32, color: "primary.main" }} />
        <Box
          sx={{
            position: "absolute",
            top: -4,
            right: -4,
            width: 12,
            height: 12,
            bgcolor: "warning.main",
            border: 2,
            borderColor: "common.white",
          }}
        />
      </Box>
      <Typography variant="h5" fontWeight={800}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 420, lineHeight: 1.7 }}>
        {description}
      </Typography>
      <Box sx={{ mt: 4, display: "flex", gap: 1 }}>
        <Box sx={{ height: 6, width: 32, bgcolor: "primary.main" }} />
        <Box sx={{ height: 6, width: 16, bgcolor: "primary.light" }} />
        <Box sx={{ height: 6, width: 8, bgcolor: "primary.50" }} />
      </Box>
    </Paper>
  );
}
