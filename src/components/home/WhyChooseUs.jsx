"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import { motion } from "motion/react";

import StoreContainer from "@/components/container/StoreContainer";
import HomeSectionHeader from "@/components/home/HomeSectionHeader";

const FEATURES = [
  {
    icon: PaymentsOutlinedIcon,
    title: "Cash on delivery",
    description: "Shop with confidence — pay only when your parcel arrives.",
  },
  {
    icon: PublicOutlinedIcon,
    title: "Imported products",
    description: "We offer a wide range of imported products from around the world.",
  },
  {
    icon: VerifiedOutlinedIcon,
    title: "Quality you can trust",
    description: "Carefully selected pieces with attention to finish and detail.",
  },
  {
    icon: SupportAgentOutlinedIcon,
    title: "Friendly support",
    description: "Need help with an order? We’re here whenever you need us.",
  },
];

const easeOut = [0.22, 1, 0.36, 1];

export default function WhyChooseUs() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 5, sm: 6, md: 8 },
        bgcolor: "grey.50",
        borderTop: 1,
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <StoreContainer>
        <HomeSectionHeader
          align="center"
          eyebrow="Why choose us?"
          title="Why is Jara special?"
          subtitle="Simple shopping, careful packaging, and support that actually helps — every order."
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: { xs: 2, sm: 2.5, lg: 3 },
          }}
        >
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Box
                key={feature.title}
                component={motion.div}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.4, delay: index * 0.06, ease: easeOut }}
              >
                <Stack
                  spacing={1.5}
                  sx={{
                    height: 1,
                    px: { xs: 2, sm: 2.25 },
                    py: { xs: 2.25, sm: 2.5 },
                    borderRadius: 2,
                    border: 1,
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    transition: "border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease",
                    "&:hover": {
                      borderColor: "primary.light",
                      boxShadow: "0 12px 28px -16px rgba(15, 23, 42, 0.2)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "primary.50",
                      color: "primary.main",
                    }}
                  >
                    <Icon sx={{ fontSize: 26 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            );
          })}
        </Box>
      </StoreContainer>
    </Box>
  );
}
