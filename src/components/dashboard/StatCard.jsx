"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { MotionFadeIn } from "@/components/dashboard/MotionFade";
import { StatSparkline } from "@/components/dashboard/RevenueChart";

const accents = {
  indigo: { bg: "primary.50", color: "primary.main", spark: "#6366f1" },
  emerald: { bg: "success.50", color: "success.main", spark: "#10b981" },
  amber: { bg: "warning.50", color: "warning.main", spark: "#f59e0b" },
  rose: { bg: "error.50", color: "error.main", spark: "#f43f5e" },
};

const sparkData = {
  indigo: [
    { value: 30 }, { value: 45 }, { value: 38 }, { value: 52 }, { value: 48 }, { value: 65 }, { value: 58 },
  ],
  emerald: [
    { value: 20 }, { value: 35 }, { value: 42 }, { value: 38 }, { value: 55 }, { value: 50 }, { value: 62 },
  ],
  amber: [
    { value: 40 }, { value: 32 }, { value: 48 }, { value: 44 }, { value: 36 }, { value: 52 }, { value: 47 },
  ],
  rose: [
    { value: 25 }, { value: 38 }, { value: 42 }, { value: 50 }, { value: 46 }, { value: 58 }, { value: 54 },
  ],
};

export default function StatCard({
  title,
  value,
  subtitle,
  accent = "indigo",
  delay = 0,
  icon: Icon,
}) {
  const tone = accents[accent] || accents.indigo;

  return (
    <MotionFadeIn delay={delay}>
      <Paper
        elevation={0}
        sx={{
          height: 1,
          p: { xs: 2, sm: 2.5 },
          border: 1,
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
          transition: "box-shadow 0.2s ease, border-color 0.2s ease",
          "&:hover": {
            borderColor: "grey.300",
            boxShadow: "0 12px 28px -18px rgba(15,23,42,0.25)",
          },
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={800} noWrap sx={{ mt: 1, letterSpacing: "-0.02em" }}>
              {value}
            </Typography>
            {subtitle ? (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: "block", lineHeight: 1.4 }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          {Icon ? (
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: tone.bg,
                color: tone.color,
                flexShrink: 0,
              }}
            >
              <Icon sx={{ fontSize: 18 }} />
            </Box>
          ) : null}
        </Stack>
        <Box sx={{ mt: 2, height: 36, width: 1, display: { xs: "none", sm: "block" } }}>
          <StatSparkline data={sparkData[accent] || sparkData.indigo} color={tone.spark} />
        </Box>
      </Paper>
    </MotionFadeIn>
  );
}
