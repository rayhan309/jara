"use client";

import { Toaster, ToastBar, toast } from "react-hot-toast";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";

const TONE = {
  success: {
    bg: "#ecfdf5",
    border: "#a7f3d0",
    color: "#065f46",
    icon: "#059669",
    bar: "#10b981",
  },
  error: {
    bg: "#fff1f2",
    border: "#fecdd3",
    color: "#9f1239",
    icon: "#e11d48",
    bar: "#e11d48",
  },
  loading: {
    bg: "#f8fafc",
    border: "#e2e8f0",
    color: "#0f172a",
    icon: "var(--store-primary, #4f46e5)",
    bar: "var(--store-primary, #4f46e5)",
  },
  blank: {
    bg: "#eef2ff",
    border: "#c7d2fe",
    color: "#312e81",
    icon: "var(--store-primary, #4f46e5)",
    bar: "var(--store-primary, #4f46e5)",
  },
};

function ToastIcon({ type, color }) {
  const sx = { fontSize: 22, color };
  if (type === "success") return <CheckCircleRoundedIcon sx={sx} />;
  if (type === "error") return <ErrorRoundedIcon sx={sx} />;
  return <InfoRoundedIcon sx={sx} />;
}

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      gutter={12}
      containerStyle={{ top: 80, zIndex: 1400 }}
      toastOptions={{
        duration: 3400,
        success: { duration: 2800 },
        error: { duration: 4200 },
      }}
    >
      {(t) => {
        const tone = TONE[t.type] || TONE.blank;

        return (
          <ToastBar
            toast={t}
            style={{
              padding: 0,
              background: "transparent",
              boxShadow: "none",
              maxWidth: "none",
            }}
          >
            {({ message }) => (
              <Stack
                direction="row"
                spacing={1.25}
                alignItems="flex-start"
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  minWidth: { xs: 280, sm: 360 },
                  maxWidth: { xs: "calc(100vw - 32px)", sm: 440 },
                  pl: 1.75,
                  pr: 1,
                  py: 1.5,
                  borderRadius: 1.5,
                  bgcolor: tone.bg,
                  border: "1px solid",
                  borderColor: tone.border,
                  boxShadow: "0 16px 40px -20px rgba(15,23,42,0.35)",
                  color: tone.color,
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    bgcolor: tone.bar,
                  },
                }}
              >
                <Box sx={{ mt: "1px", display: "flex", flexShrink: 0 }}>
                  <ToastIcon type={t.type} color={tone.icon} />
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    pt: 0.15,
                    fontSize: 13.5,
                    fontWeight: 600,
                    lineHeight: 1.55,
                    color: "inherit",
                    "& > div": {
                      justifyContent: "flex-start !important",
                      margin: "0 !important",
                      color: "inherit",
                    },
                  }}
                >
                  {message}
                </Box>
                {t.type !== "loading" ? (
                  <IconButton
                    size="small"
                    aria-label="বন্ধ করুন"
                    onClick={() => toast.dismiss(t.id)}
                    sx={{
                      mt: -0.35,
                      color: "inherit",
                      opacity: 0.55,
                      "&:hover": { opacity: 1, bgcolor: "rgba(15,23,42,0.06)" },
                    }}
                  >
                    <CloseRoundedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                ) : null}
              </Stack>
            )}
          </ToastBar>
        );
      }}
    </Toaster>
  );
}
