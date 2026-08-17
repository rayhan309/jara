"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { motion } from "motion/react";
import StoreContainer from "@/components/container/StoreContainer";
import StoreShell from "@/components/layout/StoreShell";

const floatingItems = [
  { label: "404", top: "12%", left: "8%", delay: 0 },
  { label: "?", top: "22%", right: "10%", delay: 0.2 },
  { label: "0", bottom: "28%", left: "12%", delay: 0.4 },
  { label: "4", bottom: "18%", right: "14%", delay: 0.6 },
];

export default function NotFoundPage() {
  return (
    <StoreShell>
      <Box sx={{ position: "relative", overflow: "hidden" }}>
        <Box
          aria-hidden
          sx={{
            pointerEvents: "none",
            position: "absolute",
            inset: 0,
            opacity: 0.3,
            backgroundImage: `
              linear-gradient(to right, #e4e4e7 1px, transparent 1px),
              linear-gradient(to bottom, #e4e4e7 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {floatingItems.map((item) => (
          <Typography
            key={item.label + item.delay}
            component={motion.span}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0.06, 0.12, 0.06],
              y: [0, -14, 0],
              rotate: [0, 6, 0],
            }}
            transition={{
              duration: 5 + item.delay * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: item.delay,
            }}
            sx={{
              pointerEvents: "none",
              position: "absolute",
              fontSize: { xs: "4rem", sm: "5rem" },
              fontWeight: 900,
              color: "primary.100",
              top: item.top,
              left: item.left,
              right: item.right,
              bottom: item.bottom,
            }}
          >
            {item.label}
          </Typography>
        ))}

        <StoreContainer className="relative z-10 py-12 sm:py-16 lg:py-24">
          <Stack alignItems="center" sx={{ textAlign: "center", justifyContent: "center" }}>
          <Box
            component={motion.div}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            sx={{ position: "relative", mb: 4 }}
          >
            <Box
              component={motion.div}
              animate={{ rotate: [0, -4, 4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: { xs: 96, sm: 112 },
                height: { xs: 96, sm: 112 },
                borderRadius: 1,
                border: 2,
                borderStyle: "dashed",
                borderColor: "primary.light",
                bgcolor: "primary.50",
              }}
            >
              <Inventory2OutlinedIcon sx={{ fontSize: { xs: 40, sm: 48 }, color: "primary.main" }} />
            </Box>
            <Typography
              component={motion.span}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 260 }}
              sx={{
                position: "absolute",
                top: -8,
                right: -8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: "primary.main",
                color: "common.white",
                fontWeight: 700,
                boxShadow: 3,
              }}
            >
              ?
            </Typography>
          </Box>

          <Typography
            component={motion.p}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            variant="caption"
            fontWeight={600}
            color="primary.main"
            sx={{ letterSpacing: "0.12em" }}
          >
            পেজ পাওয়া যায়নি
          </Typography>

          <Typography
            component={motion.h1}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            variant="h2"
            fontWeight={900}
            sx={{ mt: 1.5, fontSize: { xs: "3rem", sm: "4.5rem" } }}
          >
            <Typography
              component={motion.span}
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              color="primary.main"
            >
              4
            </Typography>
            <Typography
              component={motion.span}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              sx={{ display: "inline-block" }}
            >
              0
            </Typography>
            <Typography
              component={motion.span}
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
              color="primary.main"
            >
              4
            </Typography>
          </Typography>

          <Typography
            component={motion.p}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2, maxWidth: 420, lineHeight: 1.7 }}
          >
            আপনি যে পেজটি খুঁজছেন সেটি নেই বা সরিয়ে নেওয়া হয়েছে। চলুন আবার ঠিক পথে যাই।
          </Typography>

          <Stack
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ mt: 5 }}
          >
            <Button
              component={Link}
              href="/"
              variant="contained"
              startIcon={<HomeOutlinedIcon />}
              sx={{ width: { xs: 1, sm: "auto" } }}
            >
              হোমে ফিরুন
            </Button>
            <Button
              component={Link}
              href="/orders-traking"
              variant="outlined"
              startIcon={<SearchRoundedIcon />}
              sx={{ width: { xs: 1, sm: "auto" } }}
            >
              অর্ডার ট্র্যাক
            </Button>
          </Stack>

          <Button
            component={motion.button}
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={() => window.history.back()}
            startIcon={<ArrowBackRoundedIcon />}
            sx={{ mt: 3, color: "text.disabled" }}
          >
            পেছনে যান
          </Button>
          </Stack>
        </StoreContainer>
      </Box>
    </StoreShell>
  );
}
